"use client";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useOmeDownloadsState } from "@/common/hooks/useOmeDownloadsState";
import { useResizablePanes } from "@/common/components/Downloads/useResizablePanes";
import { useDownloadColumns } from "@/common/components/Downloads/useDownloadColumns";
import DownloadFiltersPanel from "./DownloadFiltersPanel";
import DatasetsPane from "./DatasetsPane";
import FilesPane from "./FilesPane";
import PaneDivider from "./PaneDivider";
import BulkDownloadChip from "./BulkDownloadChip";
import type { BaseSampleMetadata, OmeDownloadsConfig } from "@/common/components/Downloads/types";

// --- Responsive direction hook ---

type Direction = "row" | "column";
type ResponsiveDirection = Direction | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", Direction>>;

function useResolvedDirection(direction: ResponsiveDirection): Direction {
  const theme = useTheme();
  const matches = {
    xs: useMediaQuery(theme.breakpoints.up("xs")),
    sm: useMediaQuery(theme.breakpoints.up("sm")),
    md: useMediaQuery(theme.breakpoints.up("md")),
    lg: useMediaQuery(theme.breakpoints.up("lg")),
    xl: useMediaQuery(theme.breakpoints.up("xl")),
  };
  if (typeof direction === "string") return direction;
  for (const bp of ["xl", "lg", "md", "sm", "xs"] as const) {
    if (matches[bp] && direction[bp]) return direction[bp];
  }
  return "column";
}

// --- Main component ---

type OmeDualPaneDownloadsProps<T extends BaseSampleMetadata> = {
  config: OmeDownloadsConfig<T>;
};

const OmeDualPaneDownloadsInner = <T extends BaseSampleMetadata>({
  config,
}: OmeDualPaneDownloadsProps<T>) => {
  const isColumn = useResolvedDirection({ xs: "column", lg: "row" }) === "column";
  const { leftPct, containerRef, dividerHandlers } = useResizablePanes();
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
      <Box
        ref={containerRef}
        sx={{
          display: "grid",
          gridTemplateColumns: isColumn
            ? "minmax(0, 1fr)"
            : (theme) => `${leftPct}% ${theme.spacing(2)} minmax(0, 1fr)`,
          gridTemplateRows: isColumn ? "auto auto" : "1fr",
          rowGap: 1,
          columnGap: 0,
          height: isColumn ? "auto" : 800,
        }}
      >
        <DatasetsPane
          datasets={datasets}
          columns={datasetColumnsWithSelect}
          loading={loading}
          error={error}
          activeDataset={activeDataset}
          onActivate={setActiveDataset}
          filterModel={datasetFilterModel}
          onFilterModelChange={setDatasetFilterModel}
          isColumn={isColumn}
        />
        {!isColumn && <PaneDivider {...dividerHandlers} />}
        <FilesPane
          activeDataset={activeDataset}
          files={activeFiles}
          columns={fileColumnsWithDownload}
          loading={loading}
          selectionModel={activeSelectionModel}
          onSelectionModelChange={setActiveSelection}
          filterModel={fileFilterModel}
          onFilterModelChange={setFileFilterModel}
          isColumn={isColumn}
        />
      </Box>
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
