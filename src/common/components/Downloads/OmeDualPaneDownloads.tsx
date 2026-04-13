"use client";
import React, { type ReactNode, useRef, useState } from "react";
import { Table, TableColDef } from "@weng-lab/ui-components";
import { buildBulkFilePath } from "@/common/downloads";
import {
  IconButton,
  Box,
  Checkbox,
  Typography,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Divider,
  Stack,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import { Download, DragHandle, ExpandMore, FilterList, FilterListOff, FolderZip } from "@mui/icons-material";
import Image from "next/image";
import MultiSelect from "@/common/components/Downloads/MultiSelect";
import { useOmeDownloadsState } from "@/common/hooks/useOmeDownloadsState";
import type { BaseSampleMetadata, OmeDownloadsConfig } from "@/common/components/Downloads/types";
import { GRID_CHECKBOX_SELECTION_COL_DEF } from "@mui/x-data-grid-premium";
import BulkDownloadChip from "./BulkDownloadChip";

// --- Small helper components ---

const ControlLabelWrapper = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box width={"100%"}>
    <FormLabel>{label}</FormLabel>
    {children}
  </Box>
);

const accordionSx = {
  border: (theme: { palette: { divider: string } }) => `1px solid ${theme.palette.divider}`,
  borderRadius: 1,
};

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
  const [leftPct, setLeftPct] = useState(60);
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedDirection = useResolvedDirection({ xs: "column", lg: "row" });
  const isColumn = resolvedDirection === "column";
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
    handleDatasetSelectChange,
    handleDatasetCheckboxChange,
    hasActiveDatasetFilter,
    fileFilterModel,
    setFileFilterModel,
    fileTypeOptions,
    fileSelectedValues,
    handleFileTypeSelectChange,
    hasActiveFileFilter,
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
    bulkDownloadItems,
    datasetColumns,
    fileColumns,
    ome,
  } = state;

  const handleDividerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDividerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newPct = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftPct(Math.min(85, Math.max(15, newPct)));
  };

  const handleDividerPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Build the select column for the dataset table (needs render functions, so defined here)
  const datasetColumnsWithSelect: TableColDef[] = [
    {
      field: "_select",
      headerName: "",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      display: "flex",
      align: 'left',
      cellClassName: "MuiDataGrid-cellCheckbox",
      headerClassName: "MuiDataGrid-columnHeaderCheckbox",
      renderHeader: () => (
        <>
          <Checkbox
            checked={allCheckState === "checked"}
            indeterminate={allCheckState === "indeterminate"}
            disabled={
              allCheckState === "unchecked" &&
              visibleDatasets.every(
                (d) => !selectableByDataset.get(d.sample_id)?.size,
              )
            }
            onClick={toggleAll}
          />
          <Tooltip title={"Bulk Download"}>
            <FolderZip color="primary" />
          </Tooltip>
        </>
      ),
      renderCell: (params: { row: T }) => {
        const checkState = datasetCheckState.get(params.row.sample_id);
        const disabled = !selectableByDataset.get(params.row.sample_id)?.size;
        return (
          <Checkbox
            checked={checkState === "checked"}
            indeterminate={checkState === "indeterminate"}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              toggleDataset(params.row.sample_id);
            }}
          />
        );
      },
    },
    ...datasetColumns,
  ];

  // Build the download column for the file table
  const fileColumnsWithDownload: TableColDef[] = [
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      align: 'left',
      headerAlign: 'left',
      display: 'flex',
      renderHeader: (params) => {
        const DefaultCheckbox = GRID_CHECKBOX_SELECTION_COL_DEF.renderHeader;
        if (!DefaultCheckbox) return null;
        return (
          <>
            <DefaultCheckbox {...params} />
            <Tooltip title={"Bulk Download"}>
              <FolderZip color="primary" />
            </Tooltip>
          </>
        );
      }
    },
    {
      field: "open_access",
      headerName: "Download",
      display: "flex" as const,
      sortable: false,
      filterable: false,
      renderCell: (params: { row: { open_access: boolean; sample_id: string; filename: string } }) => {
        const { open_access, sample_id, filename } = params.row;
        const path = buildBulkFilePath(sample_id, filename, ome);
        const url = `https://downloads.mohdconsortium.org/${path}`;

        if (!open_access) {
          return (
            <IconButton
              component="a"
              href="https://anvilproject.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/logo-mark-Anvil.png" alt="AnVIL" width={28} height={28} />
            </IconButton>
          );
        }
        return (
          <IconButton component="a" href={url} download color="primary">
            <Download />
          </IconButton>
        );
      },
    },
    ...fileColumns,
  ];

  // Separate checkbox vs multiselect filters from config
  const checkboxFilters = config.datasetFilters.filter((f) => f.type === "checkbox");
  const multiselectFilters = config.datasetFilters.filter((f) => f.type === "multiselect");
  const totalActiveFilterCount =
    datasetFilterModel.items.length + fileFilterModel.items.length;

  return (
    <Box>
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ ...accordionSx, mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            <FilterList fontSize="small" />
            <Typography>Filters</Typography>
            {totalActiveFilterCount > 0 && (
              <Chip size="small" label={totalActiveFilterCount} color="primary" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Stack direction={"row"}>
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Typography>Dataset Filters</Typography>
                {hasActiveDatasetFilter && (
                  <Chip size="small" label={datasetFilterModel.items.length} color="primary" />
                )}
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                {checkboxFilters.map((filter) => (
                  <ControlLabelWrapper key={filter.field} label={filter.label}>
                    <FormGroup row>
                      {(datasetOptionsMap[filter.field] ?? []).map((option) => (
                        <FormControlLabel
                          key={option}
                          label={option}
                          control={
                            <Checkbox
                              size="small"
                              checked={(datasetSelectedValues[filter.field] ?? []).includes(option)}
                              onChange={handleDatasetCheckboxChange(filter.field, option)}
                            />
                          }
                        />
                      ))}
                    </FormGroup>
                  </ControlLabelWrapper>
                ))}
                {multiselectFilters.map((filter) => (
                  <ControlLabelWrapper key={filter.field} label={filter.label}>
                    <MultiSelect
                      options={datasetOptionsMap[filter.field] ?? []}
                      value={datasetSelectedValues[filter.field] ?? []}
                      onChange={handleDatasetSelectChange(filter.field)}
                      placeholder={filter.label}
                    />
                  </ControlLabelWrapper>
                ))}
                {hasActiveDatasetFilter && (
                  <Box sx={{ width: "100%" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<FilterListOff />}
                      onClick={() => setDatasetFilterModel({ items: [] })}
                    >
                      Reset Dataset Filters
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Typography>File Filters</Typography>
                {hasActiveFileFilter && (
                  <Chip size="small" label={fileFilterModel.items.length} color="primary" />
                )}
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <ControlLabelWrapper label="File Type">
                  <MultiSelect
                    limitTags={5}
                    chipMaxWidth={100}
                    options={fileTypeOptions}
                    value={fileSelectedValues}
                    onChange={handleFileTypeSelectChange}
                    placeholder="File Type"
                  />
                </ControlLabelWrapper>
                {hasActiveFileFilter && (
                  <Box sx={{ width: "100%" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<FilterListOff />}
                      onClick={() => setFileFilterModel({ items: [] })}
                    >
                      Reset File Filters
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>
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
        {/* Left pane: Datasets */}
        <Box
          sx={{
            gridColumn: 1,
            gridRow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            minWidth: 0,
            minHeight: 0,
            height: isColumn ? 500 : "100%",
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <Table
              label="Datasets"
              rows={datasets}
              getRowId={(row) => row.sample_id}
              loading={loading}
              error={error}
              columns={datasetColumnsWithSelect}
              onRowClick={(params) => setActiveDataset(params.row.sample_id)}
              divHeight={{ height: "100%" }}
              getRowClassName={(params) =>
                params.row.sample_id === activeDataset ? "Mui-selected" : ""
              }
              filterModel={datasetFilterModel}
              onFilterModelChange={setDatasetFilterModel}
              initialState={{
                sorting: { sortModel: [{ field: "sample_id", sort: "asc" }] },
              }}
            />
          </Box>
        </Box>
        {/* Divider */}
        {!isColumn && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gridRow: 1,
              gridColumn: 2,
              cursor: "col-resize",
            }}
            onPointerDown={handleDividerPointerDown}
            onPointerMove={handleDividerPointerMove}
            onPointerUp={handleDividerPointerUp}
          >
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                "& .MuiDivider-wrapperVertical": {
                  padding: 0,
                  display: "flex",
                },
                mx: "auto",
              }}
            >
              <DragHandle sx={{ transform: "rotate(90deg)", color: "divider" }} />
            </Divider>
          </Box>
        )}

        {/* Right pane: Files for active dataset */}
        <Box
          sx={{
            gridColumn: isColumn ? 1 : 3,
            gridRow: isColumn ? 2 : 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            minWidth: 0,
            minHeight: 0,
            height: isColumn ? 500 : "100%",
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {activeDataset ? (
              <Table
                label={`Files — ${activeDataset}`}
                rows={activeFiles}
                getRowId={(row) => row.filename}
                loading={loading}
                columns={fileColumnsWithDownload}
                checkboxSelection
                rowSelectionModel={selectedFiles}
                onRowSelectionModelChange={setSelectedFiles}
                disableRowSelectionExcludeModel
                keepNonExistentRowsSelected
                filterModel={fileFilterModel}
                onFilterModelChange={setFileFilterModel}
                isRowSelectable={(params) =>
                  !!params.row.open_access &&
                  params.row.file_type !== "Compressed Tar File"
                }
                divHeight={{ height: "100%" }}
                initialState={{
                  sorting: {
                    sortModel: [
                      { field: "open_access", sort: "desc" },
                      { field: "file_type", sort: "asc" },
                    ],
                  },
                }}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Typography color="text.secondary">
                  Select a dataset to view its files
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <BulkDownloadChip
        visible={selectedFiles.ids.size > 0}
        filePaths={filePaths}
        totalSize={totalSize}
        numFiles={selectedFiles.ids.size}
        onClear={() => setSelectedFiles({ type: "include", ids: new Set() })}
        ome={ome}
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
