import { GridLogicOperator, type GridFilterModel, type GridSortModel } from "@mui/x-data-grid-premium";
import { useTablePlotSync } from "@weng-lab/ui-components";
import { useMemo, useState } from "react";
import type { OmesDataType } from "@/common/types/globalTypes";
import { fieldsFor, plottedOnly, type Field, type SampleGroups } from "./fields";
import { sampleColumns } from "./sampleColumns";
import { filtersFromModel, toggleInModel, unshownFilters } from "./tableFilters";

const INITIAL_SORT: GridSortModel = [{ field: "sample_id", sort: "asc" }];

const NO_FILTERS: GridFilterModel = { items: [] };

/** AND alone, so the table's filters can always be read as chips - see filtersFromModel. */
const FILTER_PANEL = { logicOperators: [GridLogicOperator.And] };

/** What a page has before its query returns: one array, so the table isn't handed a new one each render. */
const NO_ROWS: never[] = [];

/**
 * An ome page's table of samples, and what its plot shares with it: the selection, the table's
 * filters - which fade the points they filter out, and which a scatter plot's chips read and edit -
 * and, for a heatmap, the samples in the table's order.
 *
 * `data` is the page's data hook's, whose rows come with their QC flagged - see toSample and
 * toQuantificationSample. The table lists every row; a plot draws only `plotted`.
 */
export const useSampleTable = <R extends SampleGroups>(ome: OmesDataType, data: R[] | undefined) => {
  const samples: R[] = data ?? NO_ROWS;
  // Memoized by hand: React Compiler won't, as both go on into calls it assumes may change them, with
  // hooks called in between. New columns on every render would send the grid back through its row
  // sync, which renders the page again.
  const fields = useMemo(() => fieldsFor(ome), [ome]);
  const columns = useMemo(() => sampleColumns(fields, samples), [fields, samples]);

  const { selected, setSelected, sortedFilteredData, autoSort, tableProps } = useTablePlotSync({
    rows: samples,
    getRowId: (row) => row.sample_id,
    initialSort: INITIAL_SORT,
  });

  // The table's filters, held here as the one source of truth the chips read and edit.
  const [filterModel, setFilterModel] = useState<GridFilterModel>(NO_FILTERS);
  const filters = filtersFromModel(filterModel, fields, samples);

  // By hand, as above: a plot handed new arrays on every render would redraw on every render.
  const plotted = useMemo(() => plottedOnly(samples), [samples]);
  const plottedInTableOrder = useMemo(() => plottedOnly(sortedFilteredData), [sortedFilteredData]);

  return {
    /** Every sample, in the order the data came in - the table's rows. */
    samples,
    /** The samples a plot draws from, in the same order: every one but those toSample leaves unplotted. */
    plotted,
    fields,
    /** Spread onto the Table - see SampleTable. */
    tableProps: {
      ...tableProps,
      columns,
      filterModel,
      onFilterModelChange: setFilterModel,
      slotProps: { ...tableProps.slotProps, filterPanel: FILTER_PANEL },
    },
    selected,
    setSelected,
    /** The plotted samples the table's filters leave in, in its order - a heatmap's columns. */
    inTableOrder: plottedInTableOrder,
    /** Whether the table keeps selected samples at the top, as a heatmap then keeps its columns. */
    autoSort,
    filters,
    /** A chip clicked, written to the table's filters. */
    toggleFilter: (field: Field, value: string) =>
      setFilterModel(toggleInModel(filterModel, field, value, fields, samples)),
    clearFilters: () => setFilterModel(NO_FILTERS),
    /** What the table filters by that the given legend rows don't show. */
    unshownFilters: (shownFields: readonly Field[]) => unshownFilters(filterModel, filters, fields, shownFields),
  };
};

export type SampleTableState<R extends SampleGroups> = ReturnType<typeof useSampleTable<R>>;
