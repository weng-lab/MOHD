/** Grouping samples by a field: what shows under the filters, and the chips a legend lists. */

import type { LegendGroup } from "@weng-lab/visualization";
import { QC_GROUP, colorOf, groupOf, labelOf, sortValues, type Field, type SampleGroups } from "./fields";

/** Everything that decides whether a sample shows. */
export type Filters = {
  /** The fields filtering applies to. Values hidden on any other field are ignored. */
  fields: readonly Field[];
  hidden: Readonly<Record<Field, ReadonlySet<string>>>;
  hideQc: boolean;
};

/** Spelled out per field rather than built from FIELDS, so adding a field without a set here fails to compile. */
export const toHiddenSets = (
  hidden: Partial<Record<Field, readonly string[]>>
): Record<Field, ReadonlySet<string>> => ({
  site: new Set(hidden.site),
  status: new Set(hidden.status),
  sex: new Set(hidden.sex),
  age: new Set(hidden.age),
  protocol: new Set(hidden.protocol),
});

/** Whether a sample passes the filters. QC samples answer to hideQc rather than the fields. */
export const passesFilters = (row: SampleGroups, filters: Filters) =>
  row.qc ? !filters.hideQc : filters.fields.every((field) => !filters.hidden[field].has(groupOf(field, row)));

/** A field's values across the participant samples given, in display order. */
export const valuesOf = (rows: readonly SampleGroups[], field: Field) =>
  sortValues(
    field,
    rows.flatMap((row) => (row.qc ? [] : [groupOf(field, row)]))
  );

/** A field's groups in the order its chips list them, QC last wherever there are QC samples. */
export const groupsOf = (rows: readonly SampleGroups[], field: Field) => [
  ...valuesOf(rows, field),
  ...(rows.some(({ qc }) => qc) ? [QC_GROUP] : []),
];

/**
 * A field's legend chips: one for every value the samples have, even one the filters have emptied, so
 * chips don't come and go under the cursor, QC samples last. A chip counts its samples `listed`, or
 * switched off - in `hidden` - every sample it stands for.
 */
export const legendGroups = (
  rows: readonly SampleGroups[],
  field: Field,
  hidden: ReadonlySet<string>,
  listed: (row: SampleGroups) => boolean
): LegendGroup[] => {
  const totals = new Map<string, number>();
  const listedCounts = new Map<string, number>();
  for (const row of rows) {
    const group = groupOf(field, row);
    totals.set(group, (totals.get(group) ?? 0) + 1);
    if (listed(row)) listedCounts.set(group, (listedCounts.get(group) ?? 0) + 1);
  }
  return groupsOf(rows, field).map((value) => ({
    value,
    label: labelOf(field, value),
    color: colorOf(field, value),
    count: (hidden.has(value) ? totals : listedCounts).get(value) ?? 0,
  }));
};
