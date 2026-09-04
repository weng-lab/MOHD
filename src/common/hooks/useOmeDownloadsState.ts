import { useState, type Dispatch, type SetStateAction } from "react";
import type { GridFilterModel, GridRowSelectionModel } from "@mui/x-data-grid-premium";
import { TableColDef } from "@weng-lab/ui-components";
import { useOmeCatalog } from "@/common/hooks/useOmeCatalog";
import { useDatasetFilters } from "@/common/hooks/downloads/useDatasetFilters";
import { useFileFilters } from "@/common/hooks/downloads/useFileFilters";
import { useDownloadSelection, type CheckState } from "@/common/hooks/downloads/useDownloadSelection";
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
} from "@/common/components/Downloads/types";
import type { OmeDownloadsConfig } from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { MultiSelectOnChange } from "@/common/components/Downloads/MultiSelect";

export type { BulkDownloadDatasetItem, BulkDownloadFileItem } from "@/common/components/Downloads/selectionSummary";

export type OmeDownloadsState<T extends BaseSampleMetadata> = {
  loading: boolean;
  error: boolean;
  /** Passthrough of the ome's static `noOpenAccess` config flag — gates bulk UI. */
  noOpenAccess: boolean;

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
 *
 * The derivations are unmemoized on purpose: React Compiler caches them, and it
 * also keeps the column arrays stable enough for the grid to preserve column
 * identity across renders.
 */
export function useOmeDownloadsState<T extends BaseSampleMetadata>(
  config: OmeDownloadsConfig<T>
): OmeDownloadsState<T> {
  const { omeKey, displayName, datasetFilters, noOpenAccess = false } = config;

  // Single fetch: datasets with metadata flattened on and files nested.
  const { datasets, loading, error } = useOmeCatalog<T>(omeKey);

  // Group files by dataset straight off the nested response — no client merge.
  const filesByDataset = new Map<string, CatalogFile[]>();
  const bundlesByDataset = new Map<string, DatasetBundle>();
  for (const dataset of datasets) {
    filesByDataset.set(dataset.sample_id, dataset.files);
    if (dataset.bundle) bundlesByDataset.set(dataset.sample_id, dataset.bundle);
  }

  const files: CatalogFile[] = datasets.flatMap((d) => d.files);

  // Which dataset is shown on the right, and its files.
  const [activeDataset, setActiveDataset] = useState<string | null>(null);
  const activeFiles = activeDataset ? (filesByDataset.get(activeDataset) ?? []) : [];
  const activeBundle = activeDataset ? bundlesByDataset.get(activeDataset) : undefined;

  // Per-pane filtering.
  const datasetFiltersState = useDatasetFilters(datasets, datasetFilters);
  const fileFiltersState = useFileFilters(files);
  const { passesFileFilter } = fileFiltersState;

  // Bridge filters -> selection: which files each dataset can contribute to a
  // bulk job (open access, and passing the active file filter).
  const selectableByDataset = new Map<string, Set<string>>();
  for (const [id, datasetFiles] of filesByDataset) {
    selectableByDataset.set(
      id,
      new Set(datasetFiles.flatMap((f) => (isFileBulkSelectable(f) && passesFileFilter(f) ? [f.filename] : [])))
    );
  }

  const selectionState = useDownloadSelection({
    selectableByDataset,
    visibleDatasets: datasetFiltersState.visibleDatasets,
    activeDataset,
    activeFiles,
  });
  const { selection } = selectionState;

  // Column definitions.
  const datasetColumns: TableColDef<T>[] = [
    { field: "sample_id", headerName: "Dataset", flex: 1, minWidth: 120 },
    ...datasetFilters.map((f) => ({
      field: f.field,
      headerName: f.label,
      type: "singleSelect" as const,
      valueOptions: datasetFiltersState.datasetOptionsMap[f.field],
      filterOperators: customSingleSelectOperators,
    })),
  ];

  const fileColumns: TableColDef<CatalogFile>[] = [
    {
      field: "file_type",
      headerName: "File Type",
      minWidth: 150,
      type: "singleSelect" as const,
      valueOptions: fileFiltersState.fileTypeOptions,
      filterOperators: customSingleSelectOperators,
    },
  ];
  // Restricted-only omes carry no size in the response, so the column is noise.
  if (!noOpenAccess) {
    fileColumns.push({
      field: "size",
      headerName: "File Size",
      valueFormatter: formatBytes,
      align: "right" as const,
    });
  }

  // Selection summaries for the chip / modal / job submission.
  const filePaths = collectFilePaths(selection, filesByDataset);
  const totalSize = totalSelectedSize(selection, filesByDataset);
  const bulkDownloadItems = buildBulkDownloadItems(selection, filesByDataset);

  return {
    loading,
    error,
    noOpenAccess,
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
