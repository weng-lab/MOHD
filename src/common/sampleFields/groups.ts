/** Grouping samples by a field: what shows under the filters, and the chips a legend lists. */

import type { LegendGroup } from "@/common/legends";
import { QC_GROUP, colorOf, groupOf, labelOf, sortValues, type Field, type SampleGroups } from "./fields";

/** Everything that decides whether a sample shows. */
export type Filters = {
  /** The fields filtering applies to. Values hidden on any other field are ignored. */
  fields: readonly Field[];
  hidden: Readonly<Record<Field, ReadonlySet<string>>>;
  hideQc: boolean;
  /** Whatever else a sample must pass that no field's chips stand for, such as a table's search. */
  others?: (row: SampleGroups) => boolean;
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

/**
 * Whether a sample passes the filters. `except` leaves one field's filter out, so the legend can
 * count a hidden group as if it were shown. QC samples answer to hideQc rather than the fields.
 */
export const passesFilters = (row: SampleGroups, filters: Filters, except?: Field) =>
  (row.qc
    ? !filters.hideQc
    : filters.fields.every((field) => field === except || !filters.hidden[field].has(groupOf(field, row)))) &&
  (filters.others?.(row) ?? true);

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
 * A field's legend chips: one for every value the samples have, even one the other filters have
 * emptied, so chips don't come and go under the cursor. QC samples come last.
 */
export const legendGroups = (rows: readonly SampleGroups[], field: Field, filters: Filters): LegendGroup[] => {
  const counts = new Map<string, number>();
  let qcCount = 0;

  for (const row of rows) {
    if (row.qc) {
      qcCount++;
    } else if (passesFilters(row, filters, field)) {
      const group = groupOf(field, row);
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
  }

  const groups = valuesOf(rows, field).map((value) => ({
    value,
    label: labelOf(field, value),
    color: colorOf(field, value),
    count: counts.get(value) ?? 0,
  }));

  return qcCount === 0
    ? groups
    : [...groups, { value: QC_GROUP, label: QC_GROUP, color: colorOf(field, QC_GROUP), count: qcCount }];
};
