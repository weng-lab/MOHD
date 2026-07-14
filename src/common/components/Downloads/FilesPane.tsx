import { Box, Typography } from "@mui/material";
import { Table, TableColDef } from "@weng-lab/ui-components";
import type { Dispatch, SetStateAction } from "react";
import type { GridFilterModel, GridRowSelectionModel } from "@mui/x-data-grid-premium";
import { isFileBulkSelectable } from "@/common/downloads";
import type { CatalogFile } from "@/common/components/Downloads/types";

type FilesPaneProps = {
  activeDataset: string | null;
  files: CatalogFile[];
  columns: TableColDef[];
  loading: boolean;
  selectionModel: GridRowSelectionModel;
  onSelectionModelChange: (model: GridRowSelectionModel) => void;
  filterModel: GridFilterModel;
  onFilterModelChange: Dispatch<SetStateAction<GridFilterModel>>;
  isColumn: boolean;
};

/** Right pane: files for the active dataset, or a prompt when none is selected. */
export default function FilesPane({
  activeDataset,
  files,
  columns,
  loading,
  selectionModel,
  onSelectionModelChange,
  filterModel,
  onFilterModelChange,
  isColumn,
}: FilesPaneProps) {
  return (
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
            rows={files}
            getRowId={(row) => row.filename}
            loading={loading}
            columns={columns}
            checkboxSelection
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
