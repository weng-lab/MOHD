import { Table, TableColDef, useSyncedTable } from "@weng-lab/ui-components";
import { GridSortModel } from "@mui/x-data-grid-premium";
import { LipidomicsDimenionalityMetadata, SharedLipidomicsDimenionalityProps } from "./page";
import { Typography } from "@mui/material";

const LipidomicsDimensionalityTable = ({
  rows,
  lipidomicsMetadata,
  tableProps,
}: SharedLipidomicsDimenionalityProps) => {
  const { loading, error } = lipidomicsMetadata;
  const columns: TableColDef<LipidomicsDimenionalityMetadata[number]>[] = [
    {
      field: "sample_id",
      headerName: "Dataset",
    },
    {
      field: "site",
      headerName: "Site",
      renderCell: (params) => params.value || "Control",
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.site))).map((site) => ({
        value: site,
        label: site || "Control",
      })),
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (params) => params.value || "Control",
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.status))).map((status) => ({
        value: status,
        label: status || "Control",
      })),
    },
    {
      field: "sex",
      headerName: "Sex",
      renderCell: (params) => {
        if (params.value === "female") return "F";
        if (params.value === "male") return "M";
        return "Control";
      },
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.sex))).map((sex) => ({
        value: sex,
        label: sex === "female" ? "F" : sex === "male" ? "M" : "Control",
      })),
    },
  ];
  const initialSort: GridSortModel = [{ field: "sample_id", sort: "asc" }];
  const { syncedTableProps } = useSyncedTable({
    tableProps,
    columns,
    initialSort,
    isPresorted: false,
  });

  return (
    <Table
      {...syncedTableProps}
      label={<Typography noWrap>Lipidomics Dimensionality Reduction</Typography>}
      rows={rows}
      loading={loading}
      error={!!error}
    />
  );
};

export default LipidomicsDimensionalityTable;
