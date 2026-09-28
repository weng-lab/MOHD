import { SyncedTableProps, Table, TableColDef, useSyncedTable, useTablePlotSync } from "@weng-lab/ui-components";
import type { GridSortModel } from "@mui/x-data-grid-premium";
import { Typography } from "@mui/material";
import { MISSING_LABEL, VALUE_LABEL_OVERRIDES } from "@/common/colors";
import { useHeldTableState } from "@/common/hooks/useHeldTableState";
import { QC_GROUP } from "@/common/sampleFields/fields";

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
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.site))).map((site) => ({
        value: site,
        label: site,
      })),
    },
    {
      field: "status",
      headerName: "Status",
      // These rows carry no kit to tell QC by, but every QC sample and only QC has no status.
      renderCell: (params) => params.value || QC_GROUP,
      type: "singleSelect",
      valueOptions: Array.from(new Set(rows.map((row) => row.status))).map((status) => ({
        value: status,
        label: status || QC_GROUP,
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

  const { syncedTableProps, autoSort } = useSyncedTable({
    tableProps,
    columns,
    initialSort: INITIAL_SORT,
    isPresorted: false,
  });
  const held = useHeldTableState(INITIAL_SORT);

  return { syncedTableProps: { ...syncedTableProps, ...held.tableProps }, autoSort };
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
