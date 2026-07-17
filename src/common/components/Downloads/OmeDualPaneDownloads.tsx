"use client";
import { Box } from "@mui/material";
import { ResizablePanes } from "@weng-lab/ui-components";
import { useOmeDownloadsState } from "@/common/hooks/useOmeDownloadsState";
import { useDownloadColumns } from "@/common/components/Downloads/useDownloadColumns";
import DownloadFiltersPanel from "./DownloadFiltersPanel";
import DatasetsPane from "./DatasetsPane";
import FilesPane from "./FilesPane";
import BulkDownloadChip from "./BulkDownloadChip";
import type { BaseSampleMetadata, OmeDownloadsConfig } from "@/common/components/Downloads/types";

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
    datasets,
    activeDataset,
    setActiveDataset,
    activeFiles,
    datasetFilterModel,
    setDatasetFilterModel,
    datasetOptionsMap,
    datasetSelectedValues,
    handleDatasetToggleChange,
    hasActiveDatasetFilter,
    fileFilterModel,
    setFileFilterModel,
    fileTypeOptions,
    fileSelectedValues,
    handleFileTypeSelectChange,
    hasActiveFileFilter,
    activeSelectionModel,
    setActiveSelection,
    numSelectedFiles,
    clearSelection,
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
  });

  return (
    <Box>
      <DownloadFiltersPanel
        datasetFilters={config.datasetFilters}
        datasetOptionsMap={datasetOptionsMap}
        datasetSelectedValues={datasetSelectedValues}
        onDatasetToggle={handleDatasetToggleChange}
        hasActiveDatasetFilter={hasActiveDatasetFilter}
        datasetFilterModel={datasetFilterModel}
        onResetDatasetFilters={() => setDatasetFilterModel({ items: [] })}
        fileTypeOptions={fileTypeOptions}
        fileSelectedValues={fileSelectedValues}
        onFileTypeChange={handleFileTypeSelectChange}
        hasActiveFileFilter={hasActiveFileFilter}
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
            columns={fileColumnsWithDownload}
            loading={loading}
            selectionModel={activeSelectionModel}
            onSelectionModelChange={setActiveSelection}
            filterModel={fileFilterModel}
            onFilterModelChange={setFileFilterModel}
          />
        }
      />
      <BulkDownloadChip
        visible={numSelectedFiles > 0}
        filePaths={filePaths}
        totalSize={totalSize}
        numFiles={numSelectedFiles}
        onClear={clearSelection}
        ome={displayName}
        bulkDownloadItems={bulkDownloadItems}
      />
    </Box>
  );
};

// Wrapper to make the generic component usable as a default export
const OmeDualPaneDownloads = <T extends BaseSampleMetadata>(
  props: OmeDualPaneDownloadsProps<T>
) => <OmeDualPaneDownloadsInner {...props} />;

export default OmeDualPaneDownloads;
