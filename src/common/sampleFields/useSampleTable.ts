import type { GridSortModel } from "@mui/x-data-grid-premium";
import { useTablePlotSync } from "@weng-lab/ui-components";
import { useMemo } from "react";
import type { OmesDataType } from "@/common/types/globalTypes";
import { QC_GROUP, columnOf, fieldsFor, plottedOnly, type Field, type SampleGroups } from "./fields";
import { groupsOf } from "./groups";
import { isSampleSelectable, sampleColumns } from "./sampleColumns";
import { chipFilters, toggleQc, unshownFilters } from "./tableFilters";

const INITIAL_SORT: GridSortModel = [{ field: "sample_id", sort: "asc" }];

/** What a page has before its query returns: one array, so the table isn't handed a new one each render. */
const NO_ROWS: never[] = [];

/**
 * An ome page's table of samples, and what its plot shares with it: the selection, the table's
 * filters - which fade the points the table doesn't list, and which a scatter plot's chips read and
 * edit - and, for a heatmap, the samples in the table's order.
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

  const {
    selected,
    setSelected,
    sortedFilteredData,
    autoSort,
    tableProps,
    filters: tableFilters,
  } = useTablePlotSync({
    rows: samples,
    getRowId: (row) => row.sample_id,
    initialSort: INITIAL_SORT,
  });

  // By hand, as above: a plot handed new arrays on every render would redraw on every render.
  const plotted = useMemo(() => plottedOnly(samples), [samples]);
  const plottedInTableOrder = useMemo(() => plottedOnly(sortedFilteredData), [sortedFilteredData]);

  return {
    /** Every sample, in the order the data came in - the table's rows. */
    samples,
    /** The samples a plot draws from, in the same order: every one not flagged unplotted. */
    plotted,
    fields,
    /** Spread onto the Table - see SampleTable. */
    tableProps: {
      ...tableProps,
      columns,
      // An unplotted sample can't be checked, as no plot could show it was.
      isRowSelectable: isSampleSelectable,
    },
    selected,
    setSelected,
    /** The plotted samples the table's filters leave in, in its order - a heatmap's columns. */
    inTableOrder: plottedInTableOrder,
    /** Whether the table keeps selected samples at the top, as a heatmap then keeps its columns. */
    autoSort,
    /** The groups the table's filters switch off, as the chips show them. */
    filters: chipFilters(tableFilters, fields, samples),
    /** Whether the table lists a sample once filtered - by a field's column, any other, or its search. */
    isListed: (row: SampleGroups) => tableFilters.isListed(row.sample_id),
    /** A chip clicked, written to the table's filters. QC's chip is one switch across every field. */
    toggleFilter: (field: Field, value: string) =>
      value === QC_GROUP
        ? tableFilters.setModel((model) => toggleQc(model, field, fields, samples))
        : tableFilters.toggle(columnOf(field), value, groupsOf(samples, field)),
    clearFilters: tableFilters.clear,
    /** What the table filters by that the given legend rows don't show. */
    unshownFilters: (shownFields: readonly Field[]) => unshownFilters(tableFilters, fields, shownFields),
  };
};

export type SampleTableState<R extends SampleGroups> = ReturnType<typeof useSampleTable<R>>;
