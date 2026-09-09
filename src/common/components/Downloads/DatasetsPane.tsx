import { Box } from "@mui/material";
import { Table, TableColDef } from "@weng-lab/ui-components";
import type { Dispatch, SetStateAction } from "react";
import type { GridFilterModel } from "@mui/x-data-grid-premium";
import type { BaseSampleMetadata, CatalogDataset } from "@/common/components/Downloads/types";

type DatasetsPaneProps = {
  datasets: CatalogDataset<BaseSampleMetadata>[];
  columns: TableColDef[];
  loading: boolean;
  error: boolean;
  activeDataset: string | null;
  onActivate: (id: string) => void;
  filterModel: GridFilterModel;
  onFilterModelChange: Dispatch<SetStateAction<GridFilterModel>>;
};

/** Left pane: the dataset (participant) grid with bulk-select + filter facets. */
export default function DatasetsPane({
  datasets,
  columns,
  loading,
  error,
  activeDataset,
  onActivate,
  filterModel,
  onFilterModelChange,
}: DatasetsPaneProps) {
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
        <Table
          label="Datasets"
          rows={datasets}
          getRowId={(row) => row.sample_id}
          loading={loading}
          error={error}
          columns={columns}
          onRowClick={(params) => onActivate(params.row.sample_id)}
          divHeight={{ height: "100%" }}
          getRowClassName={(params) => (params.row.sample_id === activeDataset ? "Mui-selected" : "")}
          filterModel={filterModel}
          onFilterModelChange={onFilterModelChange}
          initialState={{
            sorting: { sortModel: [{ field: "sample_id", sort: "asc" }] },
          }}
        />
      </Box>
    </Box>
  );
}
