import { Table, TableColDef, useSyncedTable } from "@weng-lab/ui-components";
import { GridSortModel } from "@mui/x-data-grid-premium";
import { ATACMetadata, SharedATACDimenionalityProps } from "./page";
import { Typography } from "@mui/material";
import { MISSING_LABEL, VALUE_LABEL_OVERRIDES } from "@/common/colors";

const ATACDimensionalityTable = ({ rows, ATACData, tableProps }: SharedATACDimenionalityProps) => {
  const { loading, error } = ATACData;
  const columns: TableColDef<ATACMetadata[number]>[] = [
    {
      field: "sample_id",
      headerName: "Dataset",
    },
    {
      field: "site",
      headerName: "Site",
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.site))),
    },
    {
      field: "status",
      headerName: "Status",
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.status))),
    },
    {
      field: "sex",
      headerName: "Sex",
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.sex))).map((sex) => ({
        value: sex,
        label: VALUE_LABEL_OVERRIDES[sex] ?? sex,
      })),
    },
    {
      field: "protocol",
      headerName: "Protocol",
      renderCell: (params) => params.value.replaceAll(" method", ""),
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.protocol))),
    },
    {
      field: "age_bin",
      headerName: "Age",
      renderCell: (params) => params.value ?? "",
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.age_bin))).map((age_bin) => ({
        value: age_bin,
        label: age_bin ?? MISSING_LABEL,
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
      label={<Typography noWrap>ATAC-seq Dimensionality Reduction</Typography>}
      rows={rows}
      loading={loading}
      error={!!error}
    />
  );
};

export default ATACDimensionalityTable;
