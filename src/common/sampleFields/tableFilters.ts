/**
 * An ome table's filter model, read as the plot's chips and written back from them. The table is
 * the one source of truth: its columns filter on the chips' groups, the chips show and edit those
 * filters, and the plot fades whatever the table filters out - by any column, and by its search.
 */

import {
  getGridSingleSelectOperators,
  getGridStringOperators,
  GridLogicOperator,
  type GridColDef,
  type GridFilterItem,
  type GridFilterModel,
  type GridFilterOperator,
} from "@mui/x-data-grid-premium";
import {
  QC_GROUP,
  columnOf,
  fieldOfColumn,
  groupOf,
  labelOf,
  type Field,
  type FieldDefinition,
  type SampleGroups,
} from "./fields";
import { groupsOf, toHiddenSets, type Filters } from "./groups";
import { DATASET_COLUMN } from "./sampleColumns";

type ValueTest = (value: unknown) => boolean;

const SELECT_OPERATORS = getGridSingleSelectOperators();
const TEXT_OPERATORS = getGridStringOperators();

/**
 * The grid's own test for an item, so the plot fades exactly what the table filters out, or null
 * where the item doesn't filter yet (no value picked), as the grid skips it. The select and text
 * operators read only the cell's value, so they run without a grid.
 */
const testOf = (item: GridFilterItem, operators: readonly GridFilterOperator[]): ValueTest | null => {
  const operator = operators.find(({ value }) => value === item.operator);
  return (
    (operator?.getApplyFilterFn(item, { field: item.field } as GridColDef) as ValueTest | null | undefined) ?? null
  );
};

/** The groups of a field the items on its column filter out. */
const excludedBy = (items: readonly GridFilterItem[], field: Field, options: readonly string[]) => {
  const tests = items
    .filter((item) => item.field === columnOf(field))
    .flatMap((item) => testOf(item, SELECT_OPERATORS) ?? []);
  return new Set(options.filter((group) => tests.some((test) => !test(group))));
};

/** The search's words, as the grid splits them. */
const searchWords = (model: GridFilterModel) =>
  (model.quickFilterValues ?? []).filter((word): word is string => typeof word === "string" && word !== "");

/**
 * The table's filters as the plot reads them: a field's chips struck through for the groups its
 * column filters out, QC's wherever any column filters it out, and everything else - the Dataset
 * column, the search - as one more test a sample has to pass. The table offers AND alone, so its
 * items can be read one at a time.
 */
export const filtersFromModel = (
  model: GridFilterModel,
  fields: readonly FieldDefinition[],
  samples: readonly SampleGroups[]
): Filters => {
  const hidden: Partial<Record<Field, string[]>> = {};
  let hideQc = false;
  for (const { key } of fields) {
    const excluded = excludedBy(model.items, key, groupsOf(samples, key));
    if (excluded.delete(QC_GROUP)) hideQc = true;
    hidden[key] = [...excluded];
  }

  const textTests = model.items.flatMap((item) => {
    const test = fieldOfColumn(item.field) ? null : testOf(item, TEXT_OPERATORS);
    return test ? [(row: SampleGroups) => test((row as Record<string, unknown>)[item.field])] : [];
  });

  // As the grid searches: each word, case-insensitively, against every column as it's shown.
  const words = searchWords(model).map((word) => word.toLowerCase());
  const anyWord = model.quickFilterLogicOperator === GridLogicOperator.Or;
  const matchesSearch = (row: SampleGroups) => {
    const cells = [row.sample_id, ...fields.map(({ key }) => labelOf(key, groupOf(key, row)))].map((cell) =>
      cell.toLowerCase()
    );
    const found = (word: string) => cells.some((cell) => cell.includes(word));
    return anyWord ? words.some(found) : words.every(found);
  };

  return {
    fields: fields.map(({ key }) => key),
    hidden: toHiddenSets(hidden),
    hideQc,
    others:
      textTests.length === 0 && words.length === 0
        ? undefined
        : (row) => textTests.every((test) => test(row)) && (words.length === 0 || matchesSearch(row)),
  };
};

/**
 * A field's items rewritten to filter out exactly `excluded`: "is not" for each where few are out,
 * "is any of" the rest where most are, so the table's filter panel reads the way the chips look.
 */
const withExcluded = (
  model: GridFilterModel,
  field: Field,
  excluded: ReadonlySet<string>,
  options: readonly string[]
): GridFilterModel => {
  const column = columnOf(field);
  const kept = options.filter((group) => !excluded.has(group));
  const items: GridFilterItem[] =
    excluded.size === 0
      ? []
      : kept.length > 0 && kept.length < excluded.size
        ? [{ id: `${column}:kept`, field: column, operator: "isAnyOf", value: kept }]
        : [...excluded].map((group) => ({ id: `${column}:${group}`, field: column, operator: "not", value: group }));
  return {
    ...model,
    logicOperator: GridLogicOperator.And,
    items: [...model.items.filter((item) => item.field !== column), ...items],
  };
};

/**
 * A chip clicked, as a change to the table's filters. Any other group switches in or out of its
 * field's column. QC's chip, which every legend row has, clears QC from every column that filters it
 * out, or filters it out of this one.
 */
export const toggleInModel = (
  model: GridFilterModel,
  field: Field,
  value: string,
  fields: readonly FieldDefinition[],
  samples: readonly SampleGroups[]
): GridFilterModel => {
  const excludedIn = (key: Field) => excludedBy(model.items, key, groupsOf(samples, key));

  if (value === QC_GROUP) {
    const holding = fields.filter(({ key }) => excludedIn(key).has(QC_GROUP));
    if (holding.length === 0) {
      return withExcluded(model, field, new Set([...excludedIn(field), QC_GROUP]), groupsOf(samples, field));
    }
    return holding.reduce((next, { key }) => {
      const excluded = excludedIn(key);
      excluded.delete(QC_GROUP);
      return withExcluded(next, key, excluded, groupsOf(samples, key));
    }, model);
  }

  const excluded = excludedIn(field);
  if (!excluded.delete(value)) excluded.add(value);
  return withExcluded(model, field, excluded, groupsOf(samples, field));
};

/**
 * What the table filters by that none of the plot's legend rows show: fields without a row, the
 * Dataset column and the search. Named so the plot can say why points are faded.
 */
export const unshownFilters = (
  model: GridFilterModel,
  filters: Filters,
  fields: readonly FieldDefinition[],
  shownFields: readonly Field[]
): string[] => [
  ...fields.filter(({ key }) => !shownFields.includes(key) && filters.hidden[key].size > 0).map(({ label }) => label),
  ...(model.items.some((item) => item.field === DATASET_COLUMN.field && testOf(item, TEXT_OPERATORS))
    ? [DATASET_COLUMN.headerName]
    : []),
  ...(searchWords(model).length > 0 ? ["search"] : []),
];
