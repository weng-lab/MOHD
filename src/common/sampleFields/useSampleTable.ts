import { GridLogicOperator, type GridSortModel } from "@mui/x-data-grid-premium";
import { useSyncedTable, useTablePlotSync } from "@weng-lab/ui-components";
import { useMemo } from "react";
import { NO_FILTERS, useHeldTableState } from "@/common/hooks/useHeldTableState";
import type { OmesDataType } from "@/common/types/globalTypes";
import { fieldsFor, toSample, type Field, type SampleRow } from "./fields";
import { sampleColumns } from "./sampleColumns";
import { filtersFromModel, toggleInModel, unshownFilters } from "./tableFilters";

const INITIAL_SORT: GridSortModel = [{ field: "sample_id", sort: "asc" }];

/** AND alone, so the table's filters can always be read as chips - see filtersFromModel. */
const FILTER_PANEL = { logicOperators: [GridLogicOperator.And] };

/** What a page has before its query returns: one array, so the table isn't handed a new one each render. */
const NO_ROWS: readonly never[] = [];

/**
 * An ome page's sample table and what its plots share with it: the selection, and the filters,
 * which the plots' chips read and edit and which fade the points the table filters out.
 */
export const useSampleTable = <R extends SampleRow>(ome: OmesDataType, data: readonly R[] | undefined) => {
  const rows: readonly R[] = data ?? NO_ROWS;
  // Memoized by hand: React Compiler leaves values passed into hooks alone, and new rows or columns on
  // every render send the grid back through its row sync, which renders the page again.
  const fields = useMemo(() => fieldsFor(ome), [ome]);
  const samples = useMemo(() => rows.map(toSample), [rows]);
  const columns = useMemo(() => sampleColumns(fields, samples), [fields, samples]);
  const { selected, setSelected, tableProps } = useTablePlotSync({ rows: samples, getRowId: (row) => row.sample_id });
  const { syncedTableProps } = useSyncedTable({ tableProps, columns, initialSort: INITIAL_SORT, isPresorted: false });
  const { filterModel, setFilterModel, tableProps: heldProps } = useHeldTableState(INITIAL_SORT);
  const filters = filtersFromModel(filterModel, fields, samples);

  return {
    samples,
    fields,
    /** Spread onto the Table. */
    tableProps: {
      ...syncedTableProps,
      ...heldProps,
      slotProps: { ...syncedTableProps.slotProps, filterPanel: FILTER_PANEL },
    },
    selected,
    setSelected,
    filters,
    /** A chip clicked, written to the table's filters. */
    toggleFilter: (field: Field, value: string) =>
      setFilterModel(toggleInModel(filterModel, field, value, fields, samples)),
    clearFilters: () => setFilterModel(NO_FILTERS),
    /** What the table filters by that the given legend rows don't show. */
    unshownFilters: (shownFields: readonly Field[]) => unshownFilters(filterModel, filters, fields, shownFields),
  };
};

export type SampleTableState<R extends SampleRow> = ReturnType<typeof useSampleTable<R>>;
