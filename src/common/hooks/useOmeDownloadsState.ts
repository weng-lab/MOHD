import { useMemo, useState, useCallback, type Dispatch, type SetStateAction } from "react";
import { type GridFilterModel, getGridSingleSelectOperators, type GridFilterItem, type GridRowSelectionModel } from "@mui/x-data-grid-premium";
import { TableColDef } from "@weng-lab/ui-components";
import { useOmeDownloadFiles, type DownloadFile } from "@/common/hooks/useOmeDownloadFiles";
import { buildBulkFilePath, formatBytes } from "@/common/downloads";
import type { BaseSampleMetadata, OmeDownloadsConfig } from "@/common/components/Downloads/types";
import type { MultiSelectOnChange } from "@/common/components/Downloads/MultiSelect";

// --- Shared utilities ---

const customSingleSelectOperators = getGridSingleSelectOperators().map((op) =>
  op.value === "isAnyOf"
    ? {
        ...op,
        getApplyFilterFn: (filterItem: GridFilterItem) => {
          if (!Array.isArray(filterItem.value)) return null;
          if (filterItem.value.length === 0) return () => false;
          const filterValues = filterItem.value as string[];
          return (value: string) => filterValues.includes(value);
        },
      }
    : op
);

export { customSingleSelectOperators };

function passesFilter<T extends Record<string, unknown>>(
  row: T,
  filterModel: GridFilterModel
): boolean {
  const { items, logicOperator = "and" } = filterModel;
  if (items.length === 0) return true;

  const results = items.map((item) => {
    if (item.value === undefined && item.operator !== "isEmpty" && item.operator !== "isNotEmpty") {
      return true;
    }
    const value = row[item.field] as unknown;
    switch (item.operator) {
      case "is":
      case "equals":
        return value === item.value;
      case "not":
        return value !== item.value;
      case "isAnyOf":
        return Array.isArray(item.value) && item.value.includes(value);
      case "contains":
        return typeof value === "string" && typeof item.value === "string" && value.toLowerCase().includes(item.value.toLowerCase());
      case "startsWith":
        return typeof value === "string" && typeof item.value === "string" && value.toLowerCase().startsWith(item.value.toLowerCase());
      case "endsWith":
        return typeof value === "string" && typeof item.value === "string" && value.toLowerCase().endsWith(item.value.toLowerCase());
      case "isEmpty":
        return !value;
      case "isNotEmpty":
        return !!value;
      default:
        return true;
    }
  });

  return logicOperator === "and" ? results.every(Boolean) : results.some(Boolean);
}

function hasActiveFilter(filterModel: GridFilterModel): boolean {
  return filterModel.items.some(
    (item) => item.value !== undefined || item.operator === "isEmpty" || item.operator === "isNotEmpty"
  );
}

// --- Types ---

type MergedFile = Omit<DownloadFile, "__typename"> & Record<string, unknown>;

type CheckState = "checked" | "indeterminate" | "unchecked";

export type OmeDownloadsState<T extends BaseSampleMetadata> = {
  loading: boolean;
  error: boolean;

  datasets: T[];
  files: MergedFile[];
  activeDataset: string | null;
  setActiveDataset: (id: string | null) => void;
  activeFiles: MergedFile[];

  datasetFilterModel: GridFilterModel;
  setDatasetFilterModel: Dispatch<SetStateAction<GridFilterModel>>;
  datasetOptionsMap: Record<string, string[]>;
  datasetSelectedValues: Record<string, string[]>;
  handleDatasetSelectChange: (field: string) => MultiSelectOnChange<string>;
  handleDatasetCheckboxChange: (field: string, option: string) => () => void;
  hasActiveDatasetFilter: boolean;

  fileFilterModel: GridFilterModel;
  setFileFilterModel: Dispatch<SetStateAction<GridFilterModel>>;
  fileTypeOptions: string[];
  fileSelectedValues: string[];
  handleFileTypeSelectChange: MultiSelectOnChange<string>;
  hasActiveFileFilter: boolean;

  selectedFiles: GridRowSelectionModel;
  setSelectedFiles: Dispatch<SetStateAction<GridRowSelectionModel>>;
  datasetCheckState: Map<string, CheckState>;
  allCheckState: CheckState;
  toggleAll: () => void;
  toggleDataset: (datasetId: string) => void;
  selectableByDataset: Map<string, Set<string>>;
  visibleDatasets: T[];

  filePaths: string[];
  totalSize: number;

  datasetColumns: TableColDef<T>[];
  fileColumns: TableColDef<MergedFile>[];

  ome: OmeDownloadsConfig<T>["ome"];
};

// --- Hook ---

export function useOmeDownloadsState<T extends BaseSampleMetadata>(
  config: OmeDownloadsConfig<T>
): OmeDownloadsState<T> {
  const { ome, datasetFilters, excludeRow } = config;

  // Data fetching
  const { data: rawData, loading: loadingData, error: errorData } = config.useData();
  const { data: dataFileInfo, loading: loadingFiles, error: errorFiles } = useOmeDownloadFiles(ome);

  const loading = loadingData || loadingFiles;
  const error = !!(errorData || errorFiles);

  const shouldExclude = useMemo(
    () => excludeRow ?? ((row: T) => row.sample_id.includes("_allsamples")),
    [excludeRow]
  );

  // Strip __typename from a record (GraphQL artifacts)
  const stripTypename = <R extends Record<string, unknown>>(obj: R): Omit<R, "__typename"> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __typename, ...rest } = obj;
    return rest;
  };

  // Datasets for the left pane (strip __typename)
  const datasets: T[] = useMemo(() => {
    if (!rawData) return [];
    return rawData
      .filter((d) => !shouldExclude(d as T))
      .map((d) => stripTypename(d as Record<string, unknown>) as T);
  }, [rawData, shouldExclude]);

  // All files merged with metadata
  const files: MergedFile[] = useMemo(() => {
    if (!rawData || !dataFileInfo) return [];
    const metadataMap = new Map(rawData.map((x) => [x.sample_id, x]));
    return dataFileInfo
      .filter((f) => !shouldExclude({ sample_id: f.sample_id } as T))
      .map((file) => {
        const metadata = stripTypename((metadataMap.get(file.sample_id) ?? {}) as Record<string, unknown>);
        const fileInfo = stripTypename(file as Record<string, unknown>);
        return { ...fileInfo, ...metadata, sample_id: file.sample_id } as MergedFile;
      });
  }, [rawData, dataFileInfo, shouldExclude]);

  // Group files by dataset
  const filesByDataset = useMemo(() => {
    const map = new Map<string, MergedFile[]>();
    for (const file of files) {
      const arr = map.get(file.sample_id) ?? [];
      arr.push(file);
      map.set(file.sample_id, arr);
    }
    return map;
  }, [files]);

  // Which dataset is shown on the right
  const [activeDataset, setActiveDataset] = useState<string | null>(null);

  // Source of truth: selected file IDs (filenames) across ALL datasets
  const [selectedFiles, setSelectedFiles] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  // Filter models for each pane
  const [datasetFilterModel, setDatasetFilterModel] = useState<GridFilterModel>({ items: [] });
  const [fileFilterModel, setFileFilterModel] = useState<GridFilterModel>({ items: [] });

  // Files for the active dataset
  const activeFiles = useMemo(
    () => (activeDataset ? filesByDataset.get(activeDataset) ?? [] : []),
    [filesByDataset, activeDataset]
  );

  // Dynamic options derived from data — built from config.datasetFilters
  const filterFields = useMemo(() => datasetFilters.map((f) => f.field), [datasetFilters]);

  const datasetOptionsMap: Record<string, string[]> = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const field of filterFields) {
      map[field] = [...new Set(datasets.map((d) => String(d[field as keyof T] ?? "")).filter(Boolean))];
    }
    return map;
  }, [datasets, filterFields]);

  const fileTypeOptions = useMemo(
    () => [...new Set(files.map((f) => f.file_type).filter(Boolean))],
    [files]
  );

  // Derive selected values from filter models
  const datasetSelectedValues: Record<string, string[]> = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const field of filterFields) {
      const item = datasetFilterModel.items.find((i) => i.field === field);
      if (!item) {
        result[field] = datasetOptionsMap[field];
      } else if (item.operator === "isAnyOf" && Array.isArray(item.value)) {
        result[field] = item.value;
      } else if (item.operator === "is" && item.value != null) {
        result[field] = [item.value as string];
      } else if (item.operator === "not" && item.value != null) {
        result[field] = datasetOptionsMap[field].filter((v) => v !== item.value);
      } else {
        result[field] = datasetOptionsMap[field];
      }
    }
    return result;
  }, [datasetFilterModel, datasetOptionsMap, filterFields]);

  const fileSelectedValues: string[] = useMemo(() => {
    const item = fileFilterModel.items.find((i) => i.field === "file_type");
    if (!item) return fileTypeOptions;
    if (item.operator === "isAnyOf" && Array.isArray(item.value)) return item.value;
    if (item.operator === "is" && item.value != null) return [item.value as string];
    if (item.operator === "not" && item.value != null) return fileTypeOptions.filter((v) => v !== item.value);
    return fileTypeOptions;
  }, [fileFilterModel, fileTypeOptions]);

  // --- Filter handlers ---

  const handleDatasetSelectChange = useCallback(
    (field: string): MultiSelectOnChange<string> =>
      (_event, value) => {
        setDatasetFilterModel((prev) => {
          const otherItems = prev.items.filter((item) => item.field !== field);
          if (value.length === datasetOptionsMap[field].length) {
            return { ...prev, items: otherItems };
          }
          return {
            ...prev,
            items: [...otherItems, { id: `filter-${field}`, field, operator: "isAnyOf", value }],
          };
        });
      },
    [datasetOptionsMap]
  );

  const handleDatasetCheckboxChange = useCallback(
    (field: string, option: string) => () => {
      setDatasetFilterModel((prev) => {
        const otherItems = prev.items.filter((item) => item.field !== field);
        const current = datasetSelectedValues[field];
        const next = current.includes(option)
          ? current.filter((v) => v !== option)
          : [...current, option];
        if (next.length === datasetOptionsMap[field].length) {
          return { ...prev, items: otherItems };
        }
        return {
          ...prev,
          items: [...otherItems, { id: `filter-${field}`, field, operator: "isAnyOf", value: next }],
        };
      });
    },
    [datasetOptionsMap, datasetSelectedValues]
  );

  const handleFileTypeSelectChange: MultiSelectOnChange<string> = useCallback(
    (_event, value) => {
      setFileFilterModel((prev) => {
        const otherItems = prev.items.filter((item) => item.field !== "file_type");
        if (value.length === fileTypeOptions.length) {
          return { ...prev, items: otherItems };
        }
        return {
          ...prev,
          items: [...otherItems, { id: "filter-file_type", field: "file_type", operator: "isAnyOf", value }],
        };
      });
    },
    [fileTypeOptions]
  );

  // Filter application callbacks
  const passesFileFilterFn = useCallback(
    (file: MergedFile): boolean => passesFilter(file as Record<string, unknown>, fileFilterModel),
    [fileFilterModel]
  );

  const passesDatasetFilterFn = useCallback(
    (dataset: T): boolean => passesFilter(dataset as Record<string, unknown>, datasetFilterModel),
    [datasetFilterModel]
  );

  // Datasets visible after left-pane filters
  const visibleDatasets = useMemo(
    () => datasets.filter(passesDatasetFilterFn),
    [datasets, passesDatasetFilterFn]
  );

  // Selectable files per dataset
  const selectableByDataset = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const [id, datasetFiles] of filesByDataset) {
      map.set(
        id,
        new Set(
          datasetFiles
            .filter(
              (f) =>
                f.open_access &&
                f.file_type !== "Compressed Tar File" &&
                passesFileFilterFn(f)
            )
            .map((f) => f.filename)
        )
      );
    }
    return map;
  }, [filesByDataset, passesFileFilterFn]);

  // Derive checked/indeterminate/unchecked per dataset
  const datasetCheckState = useMemo(() => {
    const map = new Map<string, CheckState>();
    for (const [id, selectable] of selectableByDataset) {
      if (selectable.size === 0) {
        map.set(id, "unchecked");
        continue;
      }
      let count = 0;
      for (const f of selectable) {
        if (selectedFiles.ids.has(f)) count++;
      }
      if (count === selectable.size) map.set(id, "checked");
      else if (count > 0) map.set(id, "indeterminate");
      else map.set(id, "unchecked");
    }
    return map;
  }, [selectableByDataset, selectedFiles]);

  // Aggregate check state across all visible datasets
  const allCheckState = useMemo((): CheckState => {
    let totalSelectable = 0;
    let totalSelected = 0;
    for (const dataset of visibleDatasets) {
      const selectable = selectableByDataset.get(dataset.sample_id);
      if (!selectable) continue;
      totalSelectable += selectable.size;
      for (const f of selectable) {
        if (selectedFiles.ids.has(f)) totalSelected++;
      }
    }
    if (totalSelectable === 0) return "unchecked";
    if (totalSelected === totalSelectable) return "checked";
    if (totalSelected > 0) return "indeterminate";
    return "unchecked";
  }, [visibleDatasets, selectableByDataset, selectedFiles]);

  // Toggle all selectable files for all visible datasets
  const toggleAll = useCallback(() => {
    setSelectedFiles((prev) => {
      const next = new Set(prev.ids);
      const deselect = allCheckState === "checked";
      for (const dataset of visibleDatasets) {
        const selectable = selectableByDataset.get(dataset.sample_id);
        if (!selectable) continue;
        for (const f of selectable) {
          if (deselect) next.delete(f);
          else next.add(f);
        }
      }
      return { type: "include", ids: next };
    });
  }, [visibleDatasets, selectableByDataset, allCheckState]);

  // Toggle all selectable files for a dataset
  const toggleDataset = useCallback(
    (datasetId: string) => {
      const selectable = selectableByDataset.get(datasetId);
      if (!selectable?.size) return;
      setSelectedFiles((prev) => {
        const next = new Set(prev.ids);
        const allSelected = datasetCheckState.get(datasetId) === "checked";
        for (const f of selectable) {
          if (allSelected) next.delete(f);
          else next.add(f);
        }
        return { type: "include", ids: next };
      });
    },
    [selectableByDataset, datasetCheckState]
  );

  // --- Column definitions ---

  const datasetColumns: TableColDef<T>[] = useMemo(() => {
    const filterCols: TableColDef<T>[] = datasetFilters.map((f) => ({
      field: f.field,
      headerName: f.label,
      type: "singleSelect" as const,
      valueOptions: datasetOptionsMap[f.field],
      filterOperators: customSingleSelectOperators,
    }));

    return [
      { field: "sample_id", headerName: "Dataset", flex: 1, minWidth: 120 },
      ...filterCols,
    ];
  }, [datasetFilters, datasetOptionsMap]);

  const fileColumns: TableColDef<MergedFile>[] = useMemo(() => [
    {
      field: "file_type",
      headerName: "File Type",
      minWidth: 150,
      type: "singleSelect" as const,
      valueOptions: fileTypeOptions,
      filterOperators: customSingleSelectOperators,
    },
    {
      field: "size",
      headerName: "File Size",
      valueFormatter: formatBytes,
      align: "right" as const,
    },
  ], [fileTypeOptions]);

  // --- Bulk download ---

  const filePaths: string[] = useMemo(() => {
    return [...selectedFiles.ids.values()]
      .map((filename) => files.find((file) => file.filename === filename))
      .filter((file) => !!file)
      .map((file) => buildBulkFilePath(file.sample_id, file.filename, ome));
  }, [selectedFiles, files, ome]);

  const totalSize: number = useMemo(() => {
    return [...selectedFiles.ids.values()]
      .map((filenameID) => files.find((x) => x.filename === filenameID))
      .reduce((sum, file) => sum + Number(file?.size), 0);
  }, [selectedFiles, files]);

  return {
    loading,
    error,
    datasets,
    files,
    activeDataset,
    setActiveDataset,
    activeFiles,
    datasetFilterModel,
    setDatasetFilterModel,
    datasetOptionsMap,
    datasetSelectedValues,
    handleDatasetSelectChange,
    handleDatasetCheckboxChange,
    hasActiveDatasetFilter: hasActiveFilter(datasetFilterModel),
    fileFilterModel,
    setFileFilterModel,
    fileTypeOptions,
    fileSelectedValues,
    handleFileTypeSelectChange,
    hasActiveFileFilter: hasActiveFilter(fileFilterModel),
    selectedFiles,
    setSelectedFiles,
    datasetCheckState,
    allCheckState,
    toggleAll,
    toggleDataset,
    selectableByDataset,
    visibleDatasets,
    filePaths,
    totalSize,
    datasetColumns,
    fileColumns,
    ome,
  };
}
