import { SyncedTableProps, Table, useSyncedTable, useTablePlotSync } from "@weng-lab/ui-components";
import type { GridSortModel } from "@mui/x-data-grid-premium";
import { Typography } from "@mui/material";
import { useMemo } from "react";
import { useHeldTableState } from "@/common/hooks/useHeldTableState";
import { fieldsFor, type SampleGroups } from "@/common/sampleFields/fields";
import { sampleColumns } from "@/common/sampleFields/sampleColumns";
import type { OmesDataType } from "@/common/types/globalTypes";

/** A heatmap's sample, its QC flagged by toQuantificationSample. */
export type QuantificationSample = SampleGroups;

const INITIAL_SORT: GridSortModel = [{ field: "sample_id", sort: "asc" }];

/**
 * A heatmap page's table, with the same columns as the dimensionality reduction pages' tables: a QC
 * sample reads "QC / Reference" in every column, a missing value "Unknown", and values are named as
 * the legends name them.
 */
export const useOmeQuantificationTable = <TSample extends QuantificationSample>({
  ome,
  rows,
  tableProps,
}: {
  ome: OmesDataType;
  rows: TSample[];
  tableProps: ReturnType<typeof useTablePlotSync<TSample>>["tableProps"];
}) => {
  // Memoized by hand, as useSampleTable's are: React Compiler leaves values passed into hooks alone.
  const columns = useMemo(() => sampleColumns(fieldsFor(ome), rows), [ome, rows]);

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
