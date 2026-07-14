import {
  getGridSingleSelectOperators,
  type GridFilterItem,
  type GridFilterModel,
} from "@mui/x-data-grid-premium";

/**
 * Pure helpers for the `GridFilterModel`s that back both download panes. No
 * React here — just model math shared by the dataset and file filter hooks.
 */

// The stock `isAnyOf` operator doesn't apply an array value the way we want, so
// swap in one that treats the value as an allow-list of exact matches.
export const customSingleSelectOperators = getGridSingleSelectOperators().map((op) =>
  op.value === "isAnyOf"
    ? {
      ...op,
      getApplyFilterFn: (filterItem: GridFilterItem) => {
        if (!Array.isArray(filterItem.value)) return null;
        if (filterItem.value.length === 0) return () => false;
        const filterValues = filterItem.value as string[];
        return (value: string) => filterValues.includes(value);
      },
    }
    : op
);

/** Apply a filter model to a plain row, mirroring the grid's own evaluation. */
export function passesFilter<T extends Record<string, unknown>>(
  row: T,
  filterModel: GridFilterModel
): boolean {
  const { items, logicOperator = "and" } = filterModel;
  if (items.length === 0) return true;

  const results = items.map((item) => {
    if (item.value === undefined && item.operator !== "isEmpty" && item.operator !== "isNotEmpty") {
      return true;
    }
    const value = row[item.field] as unknown;
    switch (item.operator) {
      case "is":
      case "equals":
        return value === item.value;
      case "not":
        return value !== item.value;
      case "isAnyOf":
        return Array.isArray(item.value) && item.value.includes(value);
      case "contains":
        return typeof value === "string" && typeof item.value === "string" && value.toLowerCase().includes(item.value.toLowerCase());
      case "startsWith":
        return typeof value === "string" && typeof item.value === "string" && value.toLowerCase().startsWith(item.value.toLowerCase());
      case "endsWith":
        return typeof value === "string" && typeof item.value === "string" && value.toLowerCase().endsWith(item.value.toLowerCase());
      case "isEmpty":
        return !value;
      case "isNotEmpty":
        return !!value;
      default:
        return true;
    }
  });

  return logicOperator === "and" ? results.every(Boolean) : results.some(Boolean);
}

/** True when the model holds at least one constraint that narrows results. */
export function hasActiveFilter(filterModel: GridFilterModel): boolean {
  return filterModel.items.some(
    (item) => item.value !== undefined || item.operator === "isEmpty" || item.operator === "isNotEmpty"
  );
}

/**
 * Decode a field's active constraint into the list of currently-selected
 * values, defaulting to all options when the field is unconstrained.
 */
export function selectedValuesForField(
  field: string,
  filterModel: GridFilterModel,
  options: string[]
): string[] {
  const item = filterModel.items.find((i) => i.field === field);
  if (!item) return options;
  if (item.operator === "isAnyOf" && Array.isArray(item.value)) return item.value;
  if (item.operator === "is" && item.value != null) return [item.value as string];
  if (item.operator === "not" && item.value != null) return options.filter((v) => v !== item.value);
  return options;
}

/**
 * Set (or clear) a field's `isAnyOf` constraint. Selecting every option is the
 * same as no filter, so that case removes the item entirely.
 */
export function withFieldFilter(
  filterModel: GridFilterModel,
  field: string,
  values: string[],
  options: string[]
): GridFilterModel {
  const otherItems = filterModel.items.filter((item) => item.field !== field);
  if (values.length === options.length) {
    return { ...filterModel, items: otherItems };
  }
  return {
    ...filterModel,
    items: [...otherItems, { id: `filter-${field}`, field, operator: "isAnyOf", value: values }],
  };
}
