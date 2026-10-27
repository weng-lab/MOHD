/**
 * An ome table's filters, read as the plot's chips and written back from them. The table is the one
 * source of truth, held by useTablePlotSync: its columns filter on the chips' groups, the chips show
 * and edit those filters, and the plot fades whatever the table doesn't list.
 *
 * QC is the one thing added here: every field's chips have a QC chip, and it's one switch across them.
 */

import { excludedValues, withExcludedValues, type TableFilters } from "@weng-lab/ui-components";
import { GridLogicOperator, type GridFilterModel } from "@mui/x-data-grid-premium";
import { QC_GROUP, columnOf, fieldOfColumn, type Field, type FieldDefinition, type SampleGroups } from "./fields";
import { groupsOf, toHiddenSets, type Filters } from "./groups";
import { DATASET_COLUMN } from "./sampleColumns";

/** The table's filters as the chips read them: a field's groups its column filters out, and QC wherever any does. */
export const chipFilters = (
  filters: TableFilters,
  fields: readonly FieldDefinition[],
  samples: readonly SampleGroups[]
): Filters => {
  const hidden: Partial<Record<Field, string[]>> = {};
  let hideQc = false;
  for (const { key } of fields) {
    const excluded = new Set(filters.excluded(columnOf(key), groupsOf(samples, key)));
    if (excluded.delete(QC_GROUP)) hideQc = true;
    hidden[key] = [...excluded];
  }
  return { fields: fields.map(({ key }) => key), hidden: toHiddenSets(hidden), hideQc };
};

/**
 * The model with a field's column filtered down to one value, as "is any of" it - the item a chip
 * legend writes when it keeps one value of three or more - and every other column's filters kept. A
 * tab that plots that value's samples alone sets it, so the table lists the samples its plot draws.
 */
export const onlyValue = (model: GridFilterModel, field: Field, value: string): GridFilterModel => {
  const column = columnOf(field);
  return {
    ...model,
    logicOperator: GridLogicOperator.And,
    items: [
      ...model.items.filter((item) => item.field !== column),
      { id: `${column}:kept`, field: column, operator: "isAnyOf", value: [value] },
    ],
  };
};

/**
 * QC filtered out of the Status column, as its chip writes it there. A heatmap page's starting filters
 * where QC samples would otherwise take up columns for little - see HeatmapQcToggle.
 */
export const QC_HIDDEN: GridFilterModel = withExcludedValues(
  { items: [] },
  columnOf("status"),
  new Set([QC_GROUP]),
  [QC_GROUP],
  "singleSelect"
);

/**
 * QC's chip clicked: clears QC from every column that filters it out, or filters it out of this
 * field's. The columns are singleSelects - see sampleColumns.
 */
export const toggleQc = (
  model: GridFilterModel,
  field: Field,
  fields: readonly FieldDefinition[],
  samples: readonly SampleGroups[]
): GridFilterModel => {
  const excludedIn = (key: Field) => new Set(excludedValues(model, columnOf(key), groupsOf(samples, key)));
  const withExcluded = (next: GridFilterModel, key: Field, excluded: ReadonlySet<string>) =>
    withExcludedValues(next, columnOf(key), excluded, groupsOf(samples, key), "singleSelect");

  const holding = fields.filter(({ key }) => excludedIn(key).has(QC_GROUP));
  if (holding.length === 0) return withExcluded(model, field, new Set([...excludedIn(field), QC_GROUP]));
  return holding.reduce((next, { key }) => {
    const excluded = excludedIn(key);
    excluded.delete(QC_GROUP);
    return withExcluded(next, key, excluded);
  }, model);
};

/**
 * What the table filters by that none of the plot's legend rows show: fields without a row, the
 * Dataset column and the search. Named so the plot can say why points are faded.
 */
export const unshownFilters = (
  filters: TableFilters,
  fields: readonly FieldDefinition[],
  shownFields: readonly Field[]
): string[] => {
  const labelOfColumn = (column: string) => {
    const field = fieldOfColumn(column);
    if (field) return fields.find(({ key }) => key === field)?.label ?? field;
    return column === DATASET_COLUMN.field ? DATASET_COLUMN.headerName : column;
  };
  return [
    ...filters.columns.filter((column) => !shownFields.some((field) => columnOf(field) === column)).map(labelOfColumn),
    ...(filters.searching ? ["search"] : []),
  ];
};
