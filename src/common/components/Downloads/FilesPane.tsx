import { Box, Button, Tooltip, Typography } from "@mui/material";
import { Download } from "@mui/icons-material";
import { Table, TableColDef } from "@weng-lab/ui-components";
import type { Dispatch, SetStateAction } from "react";
import type { GridFilterModel, GridRowSelectionModel } from "@mui/x-data-grid-premium";
import { formatBytes, isFileBulkSelectable } from "@/common/downloads";
import type { CatalogFile, DatasetBundle } from "@/common/components/Downloads/types";

type FilesPaneProps = {
  activeDataset: string | null;
  files: CatalogFile[];
  bundle: DatasetBundle | undefined;
  columns: TableColDef[];
  loading: boolean;
  /** When false (ome has no open-access files) the grid drops its bulk checkboxes. */
  selectionEnabled: boolean;
  selectionModel: GridRowSelectionModel;
  onSelectionModelChange: (model: GridRowSelectionModel) => void;
  filterModel: GridFilterModel;
  onFilterModelChange: Dispatch<SetStateAction<GridFilterModel>>;
};

/** Right pane: files for the active dataset, or a prompt when none is selected. */
export default function FilesPane({
  activeDataset,
  files,
  bundle,
  columns,
  loading,
  selectionEnabled,
  selectionModel,
  onSelectionModelChange,
  filterModel,
  onFilterModelChange,
}: FilesPaneProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minWidth: 0,
        minHeight: 0,
        height: "100%",
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {activeDataset ? (
          <Table
            label={`${activeDataset}`}
            slotProps={{
              toolbar: {
                // The whole dataset in one click, skipping the job queue. Lives in
                // the toolbar rather than the rows because its contents *are* the
                // rows — as a row it would double-count and read as selectable.
                extra: bundle ? (
                  <Tooltip
                    title={`Pre-packaged .tar.gz of every open-access file in ${activeDataset}. Restricted files are not included.`}
                  >
                    <Button
                      component="a"
                      href={bundle.url}
                      download
                      size="small"
                      variant="outlined"
                      startIcon={<Download />}
                    >
                      Download all ({formatBytes(bundle.size)})
                    </Button>
                  </Tooltip>
                ) : undefined,
              },
            }}
            rows={files}
            getRowId={(row) => row.filename}
            loading={loading}
            columns={columns}
            checkboxSelection={selectionEnabled}
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={onSelectionModelChange}
            disableRowSelectionExcludeModel
            filterModel={filterModel}
            onFilterModelChange={onFilterModelChange}
            isRowSelectable={(params) => isFileBulkSelectable(params.row)}
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
              Click a dataset to view its files
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
