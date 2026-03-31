"use client";
import { type ReactNode, useState } from "react";
import { Table } from "@weng-lab/ui-components";
import { buildBulkFilePath, formatBytes } from "@/common/downloads";
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
} from "@mui/material";
import { Download, ExpandMore, FilterList, FilterListOff } from "@mui/icons-material";
import Image from "next/image";
import MultiSelect from "@/common/components/Downloads/MultiSelect";
import BulkDownloadModal from "@/common/components/Downloads/BulkDownloadModal";
import { useOmeDownloadsState } from "@/common/hooks/useOmeDownloadsState";
import type { BaseSampleMetadata, OmeDownloadsConfig } from "@/common/components/Downloads/types";

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

// --- Main component ---

type OmeDualPaneDownloadsProps<T extends BaseSampleMetadata> = {
  config: OmeDownloadsConfig<T>;
};

const OmeDualPaneDownloadsInner = <T extends BaseSampleMetadata>({
  config,
}: OmeDualPaneDownloadsProps<T>) => {
  const [open, setOpen] = useState(false);
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
    datasetColumns,
    fileColumns,
    ome,
  } = state;

  // Build the select column for the dataset table (needs render functions, so defined here)
  const datasetColumnsWithSelect = [
    {
      field: "_select" as keyof T & string,
      headerName: "",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      display: "flex" as const,
      renderHeader: () => (
        <Checkbox
          checked={allCheckState === "checked"}
          indeterminate={allCheckState === "indeterminate"}
          disabled={
            allCheckState === "unchecked" &&
            visibleDatasets.every((d) => !(selectableByDataset.get(d.sample_id)?.size))
          }
          onClick={toggleAll}
        />
      ),
      renderCell: (params: { row: T }) => {
        const checkState = datasetCheckState.get(params.row.sample_id);
        const disabled = !(selectableByDataset.get(params.row.sample_id)?.size);
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
  const fileColumnsWithDownload = [
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

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1, height: 700 }}>
        {/* Left pane: Datasets */}
        <Box
          sx={{
            flex: "0 0 40%",
            minWidth: 300,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Accordion disableGutters elevation={0} sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                <FilterList fontSize="small" />
                <Typography>Dataset Filters</Typography>
                {hasActiveDatasetFilter && (
                  <Chip size="small" label={datasetFilterModel.items.length} color="primary" />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails
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
                    Reset Filters
                  </Button>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
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

        {/* Right pane: Files for active dataset */}
        <Box
          sx={{
            flex: 1,
            minWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Accordion disableGutters elevation={0} sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                <FilterList fontSize="small" />
                <Typography>File Filters</Typography>
                {hasActiveFileFilter && (
                  <Chip size="small" label={fileFilterModel.items.length} color="primary" />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails
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
                    Reset Filters
                  </Button>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
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
      <Button
        variant="contained"
        color="primary"
        startIcon={<Download />}
        onClick={() => setOpen(true)}
        disabled={selectedFiles.ids.size === 0}
        sx={{ mt: 1 }}
      >
        Bulk Download ({selectedFiles.ids.size})
      </Button>
      <BulkDownloadModal
        open={open}
        onClose={() => setOpen(false)}
        filePaths={filePaths}
        totalSize={totalSize}
        ome={ome}
      />
    </Box>
  );
};

// Wrapper to make the generic component usable as a default export
const OmeDualPaneDownloads = <T extends BaseSampleMetadata>(
  props: OmeDualPaneDownloadsProps<T>
) => <OmeDualPaneDownloadsInner {...props} />;

export default OmeDualPaneDownloads;
