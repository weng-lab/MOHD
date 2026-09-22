import { SyncedTableProps, Table, TableColDef, useSyncedTable, useTablePlotSync } from "@weng-lab/ui-components";
import { GridSortModel } from "@mui/x-data-grid-premium";
import { Typography } from "@mui/material";
import { MISSING_LABEL, VALUE_LABEL_OVERRIDES } from "@/common/colors";

export type QuantificationSample = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  age_bin?: string | null;
};

const INITIAL_SORT: GridSortModel = [{ field: "sample_id", sort: "asc" }];

export const useOmeQuantificationTable = <TSample extends QuantificationSample>({
  rows,
  tableProps,
  hasAge = false,
}: {
  rows: TSample[];
  tableProps: ReturnType<typeof useTablePlotSync<TSample>>["tableProps"];
  /** Only set for rows whose query actually returns age_bin - see DimensionalityScatterPlot's hasAge. */
  hasAge?: boolean;
}) => {
  const columns: TableColDef<TSample>[] = [
    {
      field: "sample_id",
      headerName: "Dataset",
    },
    {
      field: "site",
      headerName: "Site",
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.site))).map((site) => ({
        value: site,
        label: site,
      })),
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (params) => params.value || "Experimental Control",
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.status))).map((status) => ({
        value: status,
        label: status || "Experimental Control",
      })),
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
  ];

  if (hasAge) {
    columns.push({
      field: "age_bin",
      headerName: "Age",
      renderCell: (params) => params.value ?? "",
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.age_bin))).map((age_bin) => ({
        value: age_bin,
        label: age_bin ?? MISSING_LABEL,
      })),
    });
  }

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
