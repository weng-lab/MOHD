import { Box, Tooltip } from "@mui/material";
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Table, TableColDef } from "@weng-lab/ui-components";
import type { Dispatch, SetStateAction } from "react";
import type { GridFilterModel } from "@mui/x-data-grid-premium";
import type { BaseSampleMetadata, CatalogDataset } from "@/common/components/Downloads/types";

type DatasetsPaneProps = {
  datasets: CatalogDataset<BaseSampleMetadata>[];
  columns: TableColDef[];
  loading: boolean;
  error: boolean;
  /** Whether the ome has any open-access files; drives the restricted warning. */
  hasOpenAccessFiles: boolean;
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
  hasOpenAccessFiles,
  activeDataset,
  onActivate,
  filterModel,
  onFilterModelChange,
}: DatasetsPaneProps) {
  // Only warn once we know for sure — a false `hasOpenAccessFiles` while still
  // loading (or after an error) isn't proof the ome is restricted.
  const showRestrictedWarning = !loading && !error && !hasOpenAccessFiles;

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
              labelTooltip: showRestrictedWarning ? (
                <Tooltip title="This ome's files are all restricted. Please visit the MOHD page on AnVIL to register for access to restricted files.">
                  <WarningAmberRoundedIcon color="warning" fontSize="small" sx={{ display: "block" }} />
                </Tooltip>
              ) : undefined,
            },
          }}
          rows={datasets}
          getRowId={(row) => row.sample_id}
          loading={loading}
          error={error}
          columns={columns}
          onRowClick={(params) => onActivate(params.row.sample_id)}
          divHeight={{ height: "100%" }}
          getRowClassName={(params) =>
            params.row.sample_id === activeDataset ? "Mui-selected" : ""
          }
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
