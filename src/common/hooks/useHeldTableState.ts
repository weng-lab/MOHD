import type { GridFilterModel, GridSortModel } from "@mui/x-data-grid-premium";
import { useState } from "react";

export const NO_FILTERS: GridFilterModel = { items: [] };

/**
 * A table's filters and sort, held by the page rather than the grid, which loses both whenever
 * TwoPaneLayout's "Hide table" unmounts it - and the heatmaps take their columns, in order, from the
 * table. `tableProps` goes onto the Table; the filters are also there for a page's plots to read.
 */
export const useHeldTableState = (initialSort: GridSortModel) => {
  const [filterModel, setFilterModel] = useState<GridFilterModel>(NO_FILTERS);
  const [sortModel, setSortModel] = useState<GridSortModel>(initialSort);

  return {
    filterModel,
    setFilterModel,
    tableProps: { filterModel, onFilterModelChange: setFilterModel, sortModel, onSortModelChange: setSortModel },
  };
};
