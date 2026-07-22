import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { GridFilterModel, GridRowSelectionModel } from "@mui/x-data-grid-premium";
import { TableColDef } from "@weng-lab/ui-components";
import { useOmeCatalog } from "@/common/hooks/useOmeCatalog";
import { useDatasetFilters } from "@/common/hooks/downloads/useDatasetFilters";
import { useFileFilters } from "@/common/hooks/downloads/useFileFilters";
import {
  useDownloadSelection,
  type CheckState,
} from "@/common/hooks/downloads/useDownloadSelection";
import { formatBytes, isFileBulkSelectable } from "@/common/downloads";
import { customSingleSelectOperators } from "@/common/components/Downloads/filterModel";
import {
  buildBulkDownloadItems,
  collectFilePaths,
  totalSelectedSize,
  type BulkDownloadDatasetItem,
} from "@/common/components/Downloads/selectionSummary";
import type {
  BaseSampleMetadata,
  CatalogDataset,
  CatalogFile,
  DatasetBundle,
  OmeDownloadsConfig,
} from "@/common/components/Downloads/types";
import type { MultiSelectOnChange } from "@/common/components/Downloads/MultiSelect";

export type { BulkDownloadDatasetItem, BulkDownloadFileItem } from "@/common/components/Downloads/selectionSummary";

export type OmeDownloadsState<T extends BaseSampleMetadata> = {
  loading: boolean;
  error: boolean;

  datasets: CatalogDataset<T>[];
  activeDataset: string | null;
  setActiveDataset: (id: string | null) => void;
  activeFiles: CatalogFile[];
  /** The active dataset's pre-packaged archive, if it has one. */
  activeBundle: DatasetBundle | undefined;

  datasetFilterModel: GridFilterModel;
  setDatasetFilterModel: Dispatch<SetStateAction<GridFilterModel>>;
  datasetOptionsMap: Record<string, string[]>;
  datasetSelectedValues: Record<string, string[]>;
  handleDatasetToggleChange: (field: string, value: string[] | null) => void;
  hasActiveDatasetFilter: boolean;

  fileFilterModel: GridFilterModel;
  setFileFilterModel: Dispatch<SetStateAction<GridFilterModel>>;
  fileTypeOptions: string[];
  fileSelectedValues: string[];
  handleFileTypeSelectChange: MultiSelectOnChange<string>;
  hasActiveFileFilter: boolean;

  activeSelectionModel: GridRowSelectionModel;
  setActiveSelection: (model: GridRowSelectionModel) => void;
  numSelectedFiles: number;
  clearSelection: () => void;
  deselectFile: (datasetId: string, filename: string) => void;
  deselectDataset: (datasetId: string) => void;
  datasetCheckState: Map<string, CheckState>;
  allCheckState: CheckState;
  toggleAll: () => void;
  toggleDataset: (datasetId: string) => void;
  selectableByDataset: Map<string, Set<string>>;
  visibleDatasets: CatalogDataset<T>[];

  filePaths: string[];
  totalSize: number;
  bulkDownloadItems: BulkDownloadDatasetItem[];

  datasetColumns: TableColDef<T>[];
  fileColumns: TableColDef<CatalogFile>[];

  displayName: string;
};

/**
 * Composition root for the dual-pane downloads view. Fetches the ome catalog,
 * then wires together the focused hooks — dataset filters, file filters, and
 * selection — plus the pure column/summary derivations, into the single object
 * the component consumes.
 */
export function useOmeDownloadsState<T extends BaseSampleMetadata>(
  config: OmeDownloadsConfig<T>
): OmeDownloadsState<T> {
  const { omeKey, displayName, datasetFilters } = config;

  // Single fetch: datasets with metadata flattened on and files nested.
  const { datasets, loading, error } = useOmeCatalog<T>(omeKey);

  // Group files by dataset straight off the nested response — no client merge.
  const filesByDataset = useMemo(() => {
    const map = new Map<string, CatalogFile[]>();
    for (const dataset of datasets) map.set(dataset.sample_id, dataset.files);
    return map;
  }, [datasets]);

  const bundlesByDataset = useMemo(() => {
    const map = new Map<string, DatasetBundle>();
    for (const dataset of datasets) {
      if (dataset.bundle) map.set(dataset.sample_id, dataset.bundle);
    }
    return map;
  }, [datasets]);

  const files: CatalogFile[] = useMemo(() => datasets.flatMap((d) => d.files), [datasets]);

  // Which dataset is shown on the right, and its files.
  const [activeDataset, setActiveDataset] = useState<string | null>(null);
  const activeFiles = useMemo(
    () => (activeDataset ? filesByDataset.get(activeDataset) ?? [] : []),
    [filesByDataset, activeDataset]
  );
  const activeBundle = activeDataset ? bundlesByDataset.get(activeDataset) : undefined;

  // Per-pane filtering.
  const datasetFiltersState = useDatasetFilters(datasets, datasetFilters);
  const fileFiltersState = useFileFilters(files);
  const { passesFileFilter } = fileFiltersState;

  // Bridge filters -> selection: which files each dataset can contribute to a
  // bulk job (open access, and passing the active file filter).
  const selectableByDataset = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const [id, datasetFiles] of filesByDataset) {
      map.set(
        id,
        new Set(
          datasetFiles
            .filter((f) => isFileBulkSelectable(f) && passesFileFilter(f))
            .map((f) => f.filename)
        )
      );
    }
    return map;
  }, [filesByDataset, passesFileFilter]);

  const selectionState = useDownloadSelection({
    selectableByDataset,
    visibleDatasets: datasetFiltersState.visibleDatasets,
    activeDataset,
    activeFiles,
  });
  const { selection } = selectionState;

  // Column definitions (kept memoized so the grid preserves column identity).
  const datasetColumns: TableColDef<T>[] = useMemo(() => {
    const filterCols: TableColDef<T>[] = datasetFilters.map((f) => ({
      field: f.field,
      headerName: f.label,
      type: "singleSelect" as const,
      valueOptions: datasetFiltersState.datasetOptionsMap[f.field],
      filterOperators: customSingleSelectOperators,
    }));
    return [
      { field: "sample_id", headerName: "Dataset", flex: 1, minWidth: 120},
      ...filterCols,
    ];
  }, [datasetFilters, datasetFiltersState.datasetOptionsMap]);

  const fileColumns: TableColDef<CatalogFile>[] = useMemo(() => [
    {
      field: "file_type",
      headerName: "File Type",
      minWidth: 150,
      type: "singleSelect" as const,
      valueOptions: fileFiltersState.fileTypeOptions,
      filterOperators: customSingleSelectOperators,
    },
    {
      field: "size",
      headerName: "File Size",
      valueFormatter: formatBytes,
      align: "right" as const,
    },
  ], [fileFiltersState.fileTypeOptions]);

  // Selection summaries for the chip / modal / job submission.
  const filePaths = useMemo(() => collectFilePaths(selection, filesByDataset), [selection, filesByDataset]);
  const totalSize = useMemo(() => totalSelectedSize(selection, filesByDataset), [selection, filesByDataset]);
  const bulkDownloadItems = useMemo(
    () => buildBulkDownloadItems(selection, filesByDataset),
    [selection, filesByDataset]
  );

  return {
    loading,
    error,
    datasets,
    activeDataset,
    setActiveDataset,
    activeFiles,
    activeBundle,

    datasetFilterModel: datasetFiltersState.datasetFilterModel,
    setDatasetFilterModel: datasetFiltersState.setDatasetFilterModel,
    datasetOptionsMap: datasetFiltersState.datasetOptionsMap,
    datasetSelectedValues: datasetFiltersState.datasetSelectedValues,
    handleDatasetToggleChange: datasetFiltersState.handleDatasetToggleChange,
    hasActiveDatasetFilter: datasetFiltersState.hasActiveDatasetFilter,
    visibleDatasets: datasetFiltersState.visibleDatasets,

    fileFilterModel: fileFiltersState.fileFilterModel,
    setFileFilterModel: fileFiltersState.setFileFilterModel,
    fileTypeOptions: fileFiltersState.fileTypeOptions,
    fileSelectedValues: fileFiltersState.fileSelectedValues,
    handleFileTypeSelectChange: fileFiltersState.handleFileTypeSelectChange,
    hasActiveFileFilter: fileFiltersState.hasActiveFileFilter,

    activeSelectionModel: selectionState.activeSelectionModel,
    setActiveSelection: selectionState.setActiveSelection,
    numSelectedFiles: selectionState.numSelectedFiles,
    clearSelection: selectionState.clearSelection,
    deselectFile: selectionState.deselectFile,
    deselectDataset: selectionState.deselectDataset,
    datasetCheckState: selectionState.datasetCheckState,
    allCheckState: selectionState.allCheckState,
    toggleAll: selectionState.toggleAll,
    toggleDataset: selectionState.toggleDataset,
    selectableByDataset,

    filePaths,
    totalSize,
    bulkDownloadItems,
    datasetColumns,
    fileColumns,
    displayName,
  };
}
