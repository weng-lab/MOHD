import { Typography } from "@mui/material";
import { Table } from "@weng-lab/ui-components";
import type { SampleRow } from "./fields";
import type { SampleTableState } from "./useSampleTable";

export type SampleTableProps<R extends SampleRow> = {
  label: string;
  table: SampleTableState<R>;
  loading: boolean;
  error: unknown;
};

/** An ome page's table of samples, whose filters its plots read - see useSampleTable. */
const SampleTable = <R extends SampleRow>({ label, table, loading, error }: SampleTableProps<R>) => (
  <Table
    {...table.tableProps}
    label={<Typography noWrap>{label}</Typography>}
    rows={table.samples}
    loading={loading}
    error={!!error}
  />
);

export default SampleTable;
