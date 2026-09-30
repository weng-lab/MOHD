import { Typography } from "@mui/material";
import { Table } from "@weng-lab/ui-components";
import type { SampleGroups } from "./fields";
import type { SampleTableState } from "./useSampleTable";

export type SampleTableProps<R extends SampleGroups> = {
  label: string;
  table: SampleTableState<R>;
  loading: boolean;
  error: unknown;
};

/** An ome page's table of samples, beside a scatter plot or a heatmap - see useSampleTable. */
const SampleTable = <R extends SampleGroups>({ label, table, loading, error }: SampleTableProps<R>) => (
  <Table
    {...table.tableProps}
    label={<Typography noWrap>{label}</Typography>}
    rows={table.samples}
    loading={loading}
    error={!!error}
  />
);

export default SampleTable;
