import { useState, type Dispatch, type SetStateAction } from "react";
import type { GridFilterModel } from "@mui/x-data-grid-premium";
import {
  hasActiveFilter,
  passesFilter,
  selectedValuesForField,
  withFieldFilter,
} from "@/common/components/Downloads/filterModel";
import type { BaseSampleMetadata, CatalogDataset, FilterFieldConfig } from "@/common/components/Downloads/types";
import { fieldOfColumn, sortValues } from "@/common/sampleFields/fields";

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
 *
 * The derivations below are left unmemoized on purpose — React Compiler caches
 * them, and hand-written deps here would only be a second thing to keep in sync.
 */
export function useDatasetFilters<T extends BaseSampleMetadata>(
  datasets: CatalogDataset<T>[],
  datasetFilters: FilterFieldConfig<T>[]
): DatasetFiltersState<T> {
  const [datasetFilterModel, setDatasetFilterModel] = useState<GridFilterModel>({ items: [] });

  const filterFields = datasetFilters.map((f) => f.field);

  // A sample field's options are ordered as on every other table (age by band, QC / Reference
  // last); any other field's stay in the order they first appear.
  const datasetOptionsMap: Record<string, string[]> = {};
  for (const field of filterFields) {
    const values = [
      ...new Set(
        datasets.flatMap((d) => {
          const value = String(d[field as keyof T] ?? "");
          return value ? [value] : [];
        })
      ),
    ];
    const sampleField = fieldOfColumn(field);
    datasetOptionsMap[field] = sampleField ? sortValues(sampleField, values) : values;
  }

  const datasetSelectedValues: Record<string, string[]> = {};
  for (const field of filterFields) {
    datasetSelectedValues[field] = selectedValuesForField(field, datasetFilterModel, datasetOptionsMap[field]);
  }

  const handleDatasetToggleChange = (field: string, value: string[] | null) => {
    setDatasetFilterModel((prev) => withFieldFilter(prev, field, value ?? [], datasetOptionsMap[field]));
  };

  const visibleDatasets = datasets.filter((d) => passesFilter(d as Record<string, unknown>, datasetFilterModel));

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
