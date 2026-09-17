import { Table, TableColDef, useSyncedTable } from "@weng-lab/ui-components";
import { GridSortModel } from "@mui/x-data-grid-premium";
import { RNAMetadata, SharedRNADimenionalityProps } from "./page";
import { Typography } from "@mui/material";
import { MISSING_LABEL } from "@/common/colors";

const RNADimensionalityTable = ({ rows, RNAData, tableProps }: SharedRNADimenionalityProps) => {
  const { loading, error } = RNAData;
  const columns: TableColDef<RNAMetadata[number]>[] = [
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
      valueOptions: Array.from(new Set(rows.map((row) => row.sex))),
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
      label={<Typography noWrap>RNA-seq Dimensionality Reduction</Typography>}
      rows={rows}
      loading={loading}
      error={!!error}
    />
  );
};

export default RNADimensionalityTable;
