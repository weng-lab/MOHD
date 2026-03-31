"use client";
import { useWGBSData } from "@/common/hooks/omeHooks/useWGBSData";
import { useOmeDownloadFiles } from "@/common/hooks/useOmeDownloadFiles";
import { type ReactNode, useMemo, useState, useCallback } from "react";
import { Table, TableColDef } from "@weng-lab/ui-components";
import { type GridFilterModel, getGridSingleSelectOperators, type GridFilterItem, GridRowSelectionModel } from "@mui/x-data-grid-premium";
import { buildBulkFilePath, formatBytes } from "@/common/downloads";
import { OmeEnum } from "@/common/types/generated/graphql";
import { IconButton, Box, Checkbox, Typography, FormControlLabel, FormGroup, FormLabel, Accordion, AccordionSummary, AccordionDetails, Chip, Button } from "@mui/material";
import { Download, ExpandMore, FilterList, FilterListOff } from "@mui/icons-material";
import Image from "next/image";
import MultiSelect, { type MultiSelectOnChange } from "./MultiSelect";
import BulkDownloadModal from "@/common/components/Downloads/BulkDownloadModal";

type DatasetRow = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  kit: string;
};

type DatasetFilterField = "site" | "status" | "sex";
const DATASET_CHECKBOX_FIELDS: DatasetFilterField[] = ["sex", "status"];

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

const ControlLabelWrapper = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box width={'100%'}>
    <FormLabel>{label}</FormLabel>
    {children}
  </Box>
);

const WGBSDownloads = () => {
  const [open, setOpen] = useState(false);

  const { data: dataWGBS, loading: loadingWGBS, error: errorWGBS } = useWGBSData({ skip: false });
  const { data: dataFileInfo, loading: loadingFileInfo, error: errorFileInfo } = useOmeDownloadFiles(OmeEnum.Wgbs);

  const loading = loadingWGBS || loadingFileInfo;
  const error = !!(errorWGBS || errorFileInfo);

  // Datasets for the left pane (strip __typename)
  const datasets: DatasetRow[] = useMemo(() => {
    if (!dataWGBS) return [];
    return dataWGBS
      .filter((d) => !d.sample_id.includes("_allsamples"))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ __typename: _, ...rest }) => rest);
  }, [dataWGBS]);

  // All files merged with metadata
  const files = useMemo(() => {
    if (!dataWGBS || !dataFileInfo) return [];
    const metadataMap = new Map(dataWGBS.map((x) => [x.sample_id, x]));
    return dataFileInfo
      .filter((f) => !f.sample_id.includes("_allsamples"))
      .map((file) => {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const { __typename: _, ...metadata } = metadataMap.get(file.sample_id) ?? {};
        const { __typename: __, ...fileInfo } = file;
        /* eslint-enable @typescript-eslint/no-unused-vars */
        return { ...fileInfo, ...metadata, sample_id: file.sample_id };
      });
  }, [dataWGBS, dataFileInfo]);

  // Group files by dataset
  const filesByDataset = useMemo(() => {
    const map = new Map<string, typeof files>();
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

  // Dynamic options derived from data
  const datasetOptionsMap = useMemo(() => ({
    site: [...new Set(datasets.map((d) => d.site).filter(Boolean))],
    status: [...new Set(datasets.map((d) => d.status).filter(Boolean))],
    sex: [...new Set(datasets.map((d) => d.sex).filter(Boolean))],
  }), [datasets]);

  const fileTypeOptions = useMemo(
    () => [...new Set(files.map((f) => f.file_type).filter(Boolean))],
    [files]
  );

  // Derive selected values from filter models (for external controls)
  const datasetSelectedValues: Record<DatasetFilterField, string[]> = useMemo(() => {
    const result = {} as Record<DatasetFilterField, string[]>;
    for (const field of ["site", "status", "sex"] as const) {
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
  }, [datasetFilterModel, datasetOptionsMap]);

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
    (field: DatasetFilterField): MultiSelectOnChange<string> =>
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
    (field: DatasetFilterField, option: string) => () => {
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

  // Apply the right pane's filter model to a file row
  const passesFileFilter = useCallback(
    (file: (typeof files)[number]): boolean => {
      const { items, logicOperator = "and" } = fileFilterModel;
      if (items.length === 0) return true;

      const results = items.map((item) => {
        if (item.value === undefined && item.operator !== "isEmpty" && item.operator !== "isNotEmpty") {
          return true;
        }
        const value = file[item.field as keyof typeof file] as unknown;
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
    },
    [fileFilterModel]
  );

  // Apply the left pane's filter model to a dataset row
  const passesDatasetFilter = useCallback(
    (dataset: DatasetRow): boolean => {
      const { items, logicOperator = "and" } = datasetFilterModel;
      if (items.length === 0) return true;

      const results = items.map((item) => {
        if (item.value === undefined && item.operator !== "isEmpty" && item.operator !== "isNotEmpty") {
          return true;
        }
        const value = dataset[item.field as keyof DatasetRow] as unknown;
        switch (item.operator) {
          case "is":
          case "equals":
            return value === item.value;
          case "not":
            return value !== item.value;
          case "isAnyOf":
            return Array.isArray(item.value) && item.value.includes(value);
          case "isEmpty":
            return !value;
          case "isNotEmpty":
            return !!value;
          default:
            return true;
        }
      });

      return logicOperator === "and" ? results.every(Boolean) : results.some(Boolean);
    },
    [datasetFilterModel]
  );

  // Datasets visible after left-pane filters — used for select-all scope
  const visibleDatasets = useMemo(
    () => datasets.filter(passesDatasetFilter),
    [datasets, passesDatasetFilter]
  );

  // Selectable files per dataset — respects both base selectability and right-pane filters
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
                passesFileFilter(f)
            )
            .map((f) => f.filename)
        )
      );
    }
    return map;
  }, [filesByDataset, passesFileFilter]);

  // Derive checked/indeterminate/unchecked per dataset from selectedFiles
  const datasetCheckState = useMemo(() => {
    const map = new Map<string, "checked" | "indeterminate" | "unchecked">();
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

  // Aggregate check state across all visible (filtered) datasets — drives the header checkbox
  const allCheckState = useMemo((): "checked" | "indeterminate" | "unchecked" => {
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

  // Dataset columns (left pane)
  const datasetColumns: TableColDef<DatasetRow>[] = [
    {
      field: "_select",
      headerName: "",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      display: 'flex',
      renderHeader: () => (
        <Checkbox
          checked={allCheckState === "checked"}
          indeterminate={allCheckState === "indeterminate"}
          disabled={allCheckState === "unchecked" && visibleDatasets.every(d => !(selectableByDataset.get(d.sample_id)?.size))}
          onClick={toggleAll}
        />
      ),
      renderCell: (params) => {
        const state = datasetCheckState.get(params.row.sample_id);
        const disabled = !(selectableByDataset.get(params.row.sample_id)?.size);
        return (
          <Checkbox
            checked={state === "checked"}
            indeterminate={state === "indeterminate"}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              toggleDataset(params.row.sample_id);
            }}
          />
        );
      },
    },
    { field: "sample_id", headerName: "Dataset", flex: 1, minWidth: 120 },
    {
      field: "site",
      headerName: "Site",
      type: "singleSelect",
      valueOptions: datasetOptionsMap.site,
      filterOperators: customSingleSelectOperators,
    },
    {
      field: "status",
      headerName: "Status",
      type: "singleSelect",
      valueOptions: datasetOptionsMap.status,
      filterOperators: customSingleSelectOperators,
    },
    {
      field: "sex",
      headerName: "Sex",
      type: "singleSelect",
      valueOptions: datasetOptionsMap.sex,
      filterOperators: customSingleSelectOperators,
    },
  ];

  // File columns (right pane)
  const fileColumns: TableColDef<(typeof files)[number]>[] = [
    {
      field: "open_access",
      headerName: "Download",
      display: 'flex',
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const { open_access, sample_id, filename } = params.row;
        const path = buildBulkFilePath(sample_id, filename, OmeEnum.Wgbs)
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
    {
      field: "file_type",
      headerName: "File Type",
      minWidth: 150,
      type: "singleSelect",
      valueOptions: fileTypeOptions,
      filterOperators: customSingleSelectOperators,
    },
    // { field: "filename", headerName: "Filename", flex: 1, minWidth: 200 },
    {
      field: "size",
      headerName: "File Size",
      valueFormatter: formatBytes,
      align: "right",
    },
  ];

  const hasActiveDatasetFilter = datasetFilterModel.items.some(
    (item) => item.value !== undefined || item.operator === "isEmpty" || item.operator === "isNotEmpty"
  );
  const hasActiveFileFilter = fileFilterModel.items.some(
    (item) => item.value !== undefined || item.operator === "isEmpty" || item.operator === "isNotEmpty"
  );

  const filePaths: string[] = useMemo(() => {
    return [...selectedFiles.ids.values()]
      .map((filename) => files.find((file) => file.filename === filename))
      .filter((file) => !!file)
      .map((file) => buildBulkFilePath(file.sample_id, file.filename, OmeEnum.Wgbs));
  }, [selectedFiles, files]);

  const totalSize: number = useMemo(() => {
    return [...selectedFiles.ids.values()]
      .map((filenameID) => files.find((x) => x.filename === filenameID))
      .reduce((sum, file) => sum + Number(file?.size), 0);
  }, [selectedFiles, files])

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
          <Accordion
            disableGutters
            elevation={0}
            sx={{
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
              >
                <FilterList fontSize="small" />
                <Typography>Dataset Filters</Typography>
                {hasActiveDatasetFilter && (
                  <Chip
                    size="small"
                    label={datasetFilterModel.items.length}
                    color="primary"
                  />
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
              {DATASET_CHECKBOX_FIELDS.map((field) => (
                <ControlLabelWrapper
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                >
                  <FormGroup row>
                    {datasetOptionsMap[field].map((option) => (
                      <FormControlLabel
                        key={option}
                        label={option}
                        control={
                          <Checkbox
                            size="small"
                            checked={datasetSelectedValues[field].includes(
                              option,
                            )}
                            onChange={handleDatasetCheckboxChange(
                              field,
                              option,
                            )}
                          />
                        }
                      />
                    ))}
                  </FormGroup>
                </ControlLabelWrapper>
              ))}
              <ControlLabelWrapper label="Site">
                <MultiSelect
                  options={datasetOptionsMap.site}
                  value={datasetSelectedValues.site}
                  onChange={handleDatasetSelectChange("site")}
                  placeholder="Site"
                />
              </ControlLabelWrapper>
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
              columns={datasetColumns}
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
          <Accordion
            disableGutters
            elevation={0}
            sx={{
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
              >
                <FilterList fontSize="small" />
                <Typography>File Filters</Typography>
                {hasActiveFileFilter && (
                  <Chip
                    size="small"
                    label={fileFilterModel.items.length}
                    color="primary"
                  />
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
                columns={fileColumns}
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
        sx={{mt: 1}}
      >
        Bulk Download ({selectedFiles.ids.size})
      </Button>
      <BulkDownloadModal
        open={open}
        onClose={() => setOpen(false)}
        filePaths={filePaths}
        totalSize={totalSize}
        ome={OmeEnum.Wgbs}
      />
    </Box>
  );
};

export default WGBSDownloads;
