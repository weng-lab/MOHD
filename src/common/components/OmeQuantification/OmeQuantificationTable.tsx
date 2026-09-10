import { SyncedTableProps, Table, TableColDef, useSyncedTable, useTablePlotSync } from "@weng-lab/ui-components";
import { GridSortModel } from "@mui/x-data-grid-premium";
import { Typography } from "@mui/material";

export type QuantificationSample = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
};

const INITIAL_SORT: GridSortModel = [{ field: "sample_id", sort: "asc" }];

export const useOmeQuantificationTable = <TSample extends QuantificationSample>({
  rows,
  tableProps,
}: {
  rows: TSample[];
  tableProps: ReturnType<typeof useTablePlotSync<TSample>>["tableProps"];
}) => {
  const columns: TableColDef<TSample>[] = [
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

  return useSyncedTable({
    tableProps,
    columns,
    initialSort: INITIAL_SORT,
    isPresorted: false,
  });
};

export type OmeQuantificationTableProps<TSample extends QuantificationSample> = {
  label: string;
  rows: TSample[];
  loading: boolean;
  error: unknown;
  syncedTableProps: SyncedTableProps<TSample>;
};

const OmeQuantificationTable = <TSample extends QuantificationSample>({
  label,
  rows,
  loading,
  error,
  syncedTableProps,
}: OmeQuantificationTableProps<TSample>) => (
  <Table
    {...syncedTableProps}
    label={<Typography noWrap>{label}</Typography>}
    rows={rows}
    loading={loading}
    error={!!error}
  />
);

export default OmeQuantificationTable;
