"use client";
import { Alert, Box } from "@mui/material";
import { ResizablePanes } from "@weng-lab/ui-components";
import { useOmeDownloadsState } from "@/common/hooks/useOmeDownloadsState";
import { useDownloadColumns } from "@/common/components/Downloads/useDownloadColumns";
import DownloadFiltersPanel from "./DownloadFiltersPanel";
import DatasetsPane from "./DatasetsPane";
import FilesPane from "./FilesPane";
import BulkDownloadChip from "./BulkDownloadChip";
import { LinkComponent } from "@/common/components/LinkComponent";
import { ANVIL_URL } from "@/common/downloads";
import type {
  BaseSampleMetadata,
  FilterFieldConfig,
} from "@/common/components/Downloads/types";

/**
 * Configuration object each ome page provides to this component. Dataset + file
 * metadata both come from the catalog keyed by `omeKey`; the page declares which
 * metadata fields become filters and whether the ome has any open-access data.
 *
 * `noOpenAccess` selects between two layouts of the same shape. It's declared
 * statically per ome — not derived from the response — so the layout is fixed on
 * first paint, with no shift once the catalog loads.
 */
export type OmeDownloadsConfig<T extends BaseSampleMetadata> = {
  /** Catalog key = the `{ome}` path param on the bulk-download service, e.g. "rna". */
  omeKey: string;

  /** Human-readable ome name, used as the job label in the downloads tray. */
  displayName: string;

  /** Which dataset metadata fields to expose as filters, and how to render them */
  datasetFilters: FilterFieldConfig<T>[];

  /**
   * True for omes with no open-access files — everything is AnVIL-gated. Drops
   * the bulk-download UI (dataset/file select columns + download tray) and the
   * file-size column (restricted files carry no size in the response), and shows
   * a restricted-access banner. The dataset/file tables and filters stay.
   */
  noOpenAccess?: boolean;
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
    noOpenAccess,
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
    bulkEnabled: !noOpenAccess,
  });

  return (
    <Box>
      {noOpenAccess && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          This ome&apos;s files are all restricted. Please visit{" "}
          <LinkComponent href={ANVIL_URL} openInNewTab showExternalIcon>
            the MOHD page on AnVIL
          </LinkComponent>{" "}
          to register for access to restricted files.
        </Alert>
      )}
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
            selectionEnabled={!noOpenAccess}
            selectionModel={activeSelectionModel}
            onSelectionModelChange={setActiveSelection}
            filterModel={fileFilterModel}
            onFilterModelChange={setFileFilterModel}
          />
        }
      />
      {!noOpenAccess && (
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
