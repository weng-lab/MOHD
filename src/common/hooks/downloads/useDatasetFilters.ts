import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { GridFilterModel } from "@mui/x-data-grid-premium";
import {
  hasActiveFilter,
  passesFilter,
  selectedValuesForField,
  withFieldFilter,
} from "@/common/components/Downloads/filterModel";
import type {
  BaseSampleMetadata,
  CatalogDataset,
  FilterFieldConfig,
} from "@/common/components/Downloads/types";

export type DatasetFiltersState<T extends BaseSampleMetadata> = {
  datasetFilterModel: GridFilterModel;
  setDatasetFilterModel: Dispatch<SetStateAction<GridFilterModel>>;
  /** field -> the distinct values present in the data (the filter's options) */
  datasetOptionsMap: Record<string, string[]>;
  /** field -> currently selected values (all options when unconstrained) */
  datasetSelectedValues: Record<string, string[]>;
  handleDatasetToggleChange: (field: string, value: string[] | null) => void;
  hasActiveDatasetFilter: boolean;
  visibleDatasets: CatalogDataset<T>[];
};

/**
 * Owns the left-pane (dataset) filter state: the grid filter model, the option
 * lists derived from the data, and the visible-after-filter dataset list.
 */
export function useDatasetFilters<T extends BaseSampleMetadata>(
  datasets: CatalogDataset<T>[],
  datasetFilters: FilterFieldConfig<T>[]
): DatasetFiltersState<T> {
  const [datasetFilterModel, setDatasetFilterModel] = useState<GridFilterModel>({ items: [] });

  const filterFields = useMemo(() => datasetFilters.map((f) => f.field), [datasetFilters]);

  const datasetOptionsMap: Record<string, string[]> = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const field of filterFields) {
      map[field] = [...new Set(datasets.map((d) => String(d[field as keyof T] ?? "")).filter(Boolean))];
    }
    return map;
  }, [datasets, filterFields]);

  const datasetSelectedValues: Record<string, string[]> = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const field of filterFields) {
      result[field] = selectedValuesForField(field, datasetFilterModel, datasetOptionsMap[field]);
    }
    return result;
  }, [datasetFilterModel, datasetOptionsMap, filterFields]);

  const handleDatasetToggleChange = useCallback(
    (field: string, value: string[] | null) => {
      setDatasetFilterModel((prev) =>
        withFieldFilter(prev, field, value ?? [], datasetOptionsMap[field])
      );
    },
    [datasetOptionsMap]
  );

  const visibleDatasets = useMemo(
    () => datasets.filter((d) => passesFilter(d as Record<string, unknown>, datasetFilterModel)),
    [datasets, datasetFilterModel]
  );

  return {
    datasetFilterModel,
    setDatasetFilterModel,
    datasetOptionsMap,
    datasetSelectedValues,
    handleDatasetToggleChange,
    hasActiveDatasetFilter: hasActiveFilter(datasetFilterModel),
    visibleDatasets,
  };
}
