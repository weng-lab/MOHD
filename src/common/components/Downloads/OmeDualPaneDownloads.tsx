"use client";
import { Box } from "@mui/material";
import { ResizablePanes } from "@weng-lab/ui-components";
import { useOmeDownloadsState } from "@/common/hooks/useOmeDownloadsState";
import { useDownloadColumns } from "@/common/components/Downloads/useDownloadColumns";
import DownloadFiltersPanel from "./DownloadFiltersPanel";
import DatasetsPane from "./DatasetsPane";
import FilesPane from "./FilesPane";
import BulkDownloadChip from "./BulkDownloadChip";
import type {
  BaseSampleMetadata,
  FilterFieldConfig,
} from "@/common/components/Downloads/types";

/**
 * Configuration object each ome page provides to this component. Dataset + file
 * metadata both come from the catalog keyed by `omeKey`; the page only declares
 * which metadata fields become filters.
 *
 * The same shape drives both layouts: when the catalog has no open-access files
 * the component drops the bulk-download UI (select columns + download tray),
 * keeping the dataset/file tables and filters. Nothing here changes between the
 * two — the distinction is derived from the response.
 */
export type OmeDownloadsConfig<T extends BaseSampleMetadata> = {
  /** Catalog key = the `{ome}` path param on the bulk-download service, e.g. "rna". */
  omeKey: string;

  /** Human-readable ome name, used as the job label in the downloads tray. */
  displayName: string;

  /** Which dataset metadata fields to expose as filters, and how to render them */
  datasetFilters: FilterFieldConfig<T>[];
};

// --- Main component ---

type OmeDualPaneDownloadsProps<T extends BaseSampleMetadata> = {
  config: OmeDownloadsConfig<T>;
};

const OmeDualPaneDownloadsInner = <T extends BaseSampleMetadata>({
  config,
}: OmeDualPaneDownloadsProps<T>) => {
  const state = useOmeDownloadsState(config);

  const {
    loading,
    error,
    hasOpenAccessFiles,
    datasets,
    activeDataset,
    setActiveDataset,
    activeFiles,
    activeBundle,
    datasetFilterModel,
    setDatasetFilterModel,
    datasetOptionsMap,
    datasetSelectedValues,
    handleDatasetToggleChange,
    fileFilterModel,
    setFileFilterModel,
    fileTypeOptions,
    fileSelectedValues,
    handleFileTypeSelectChange,
    activeSelectionModel,
    setActiveSelection,
    numSelectedFiles,
    clearSelection,
    deselectFile,
    deselectDataset,
    datasetCheckState,
    allCheckState,
    toggleAll,
    toggleDataset,
    selectableByDataset,
    visibleDatasets,
    filePaths,
    totalSize,
    bulkDownloadItems,
    datasetColumns,
    fileColumns,
    displayName,
  } = state;

  const { datasetColumnsWithSelect, fileColumnsWithDownload } = useDownloadColumns({
    datasetColumns,
    fileColumns,
    allCheckState,
    visibleDatasets,
    selectableByDataset,
    datasetCheckState,
    toggleAll,
    toggleDataset,
    bulkEnabled: hasOpenAccessFiles,
  });

  return (
    <Box>
      <DownloadFiltersPanel
        datasetFilters={config.datasetFilters}
        datasetOptionsMap={datasetOptionsMap}
        datasetSelectedValues={datasetSelectedValues}
        onDatasetToggle={handleDatasetToggleChange}
        datasetFilterModel={datasetFilterModel}
        onResetDatasetFilters={() => setDatasetFilterModel({ items: [] })}
        fileTypeOptions={fileTypeOptions}
        fileSelectedValues={fileSelectedValues}
        onFileTypeChange={handleFileTypeSelectChange}
        fileFilterModel={fileFilterModel}
        onResetFileFilters={() => setFileFilterModel({ items: [] })}
      />
      <ResizablePanes
        direction={{ xs: "column", lg: "row" }}
        min={15}
        max={85}
        rowHeight="800px"
        first={
          <DatasetsPane
            datasets={datasets}
            columns={datasetColumnsWithSelect}
            loading={loading}
            error={error}
            hasOpenAccessFiles={hasOpenAccessFiles}
            activeDataset={activeDataset}
            onActivate={setActiveDataset}
            filterModel={datasetFilterModel}
            onFilterModelChange={setDatasetFilterModel}
          />
        }
        second={
          <FilesPane
            activeDataset={activeDataset}
            files={activeFiles}
            bundle={activeBundle}
            columns={fileColumnsWithDownload}
            loading={loading}
            selectionEnabled={hasOpenAccessFiles}
            selectionModel={activeSelectionModel}
            onSelectionModelChange={setActiveSelection}
            filterModel={fileFilterModel}
            onFilterModelChange={setFileFilterModel}
          />
        }
      />
      {hasOpenAccessFiles && (
        <BulkDownloadChip
          visible={numSelectedFiles > 0}
          filePaths={filePaths}
          totalSize={totalSize}
          numFiles={numSelectedFiles}
          onClear={clearSelection}
          ome={displayName}
          bulkDownloadItems={bulkDownloadItems}
          onRemoveFile={deselectFile}
          onRemoveDataset={deselectDataset}
        />
      )}
    </Box>
  );
};

// Wrapper to make the generic component usable as a default export
const OmeDualPaneDownloads = <T extends BaseSampleMetadata>(
  props: OmeDualPaneDownloadsProps<T>
) => <OmeDualPaneDownloadsInner {...props} />;

export default OmeDualPaneDownloads;
