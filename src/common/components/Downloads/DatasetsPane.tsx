import { Box, Button, Tooltip } from "@mui/material";
import { Download } from "@mui/icons-material";
import { Table, TableColDef } from "@weng-lab/ui-components";
import type { Dispatch, SetStateAction } from "react";
import type { GridFilterModel } from "@mui/x-data-grid-premium";
import { formatBytes } from "@/common/downloads";
import type { BaseSampleMetadata, CatalogDataset, OmeFile } from "@/common/components/Downloads/types";

type DatasetsPaneProps = {
  datasets: CatalogDataset<BaseSampleMetadata>[];
  /** Files spanning the whole ome, offered as direct downloads in the toolbar. */
  omeFiles: OmeFile[];
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
  omeFiles,
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
          slotProps={{
            toolbar: {
              // Ome-wide files span every row in this grid, so they live in the
              // toolbar rather than as rows. `undefined` when there are none, not
              // `[]`: the toolbar renders a divider for any truthy `extra`.
              extra:
                omeFiles.length > 0
                  ? omeFiles.map((file) => (
                      <Tooltip key={file.filename} title={"All individual dataset quantifications joined as TSV"}>
                        <Button
                          component="a"
                          href={file.url}
                          download
                          size="small"
                          variant="outlined"
                          startIcon={<Download />}
                        >
                          {file.file_type} ({formatBytes(file.size)})
                        </Button>
                      </Tooltip>
                    ))
                  : undefined,
            },
          }}
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
