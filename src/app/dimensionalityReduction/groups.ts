import type { LegendGroup } from "@/common/components/PlotLegend";
import { QC_GROUP, colorOf, groupOf, labelOf, sortValues, type Field } from "./fields";
import type { ExplorerOme, Method } from "./omes";
import type { ExplorerData, ExplorerRow } from "./types";

/** Everything that decides whether a sample shows. */
export type Filters = {
  /** The fields the current ome offers. Values hidden on any other field are ignored. */
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

/**
 * Whether a sample passes the filters. `except` leaves one field's filter out, which is how the
 * legend counts a hidden group: as many samples as would show if it were switched back on.
 *
 * QC samples answer to hideQc alone - they have no site, status, sex or age for a field's filter
 * to say anything about.
 */
export const passesFilters = (row: ExplorerRow, filters: Filters, except?: Field) =>
  row.qc
    ? !filters.hideQc
    : filters.fields.every((field) => field === except || !filters.hidden[field].has(groupOf(field, row)));

/** The rows a method places. Every row has PCs - the server drops any without - but UMAP coordinates are checked per row. */
export const rowsFor = (data: ExplorerData, ome: ExplorerOme, method: Method) =>
  method === "UMAP" ? data[ome].rows.filter((row) => row.umap) : data[ome].rows;

/** A field's values across an ome's participant samples, in display order. */
export const valuesOf = (rows: readonly ExplorerRow[], field: Field) =>
  sortValues(
    field,
    rows.flatMap((row) => (row.qc ? [] : [groupOf(field, row)]))
  );

/**
 * The legend for the field the plot is colored by.
 *
 * Every value the ome has gets a chip, including one the other filters have emptied, so the legend
 * holds still while filters change rather than chips coming and going under the cursor. QC samples
 * get one chip of their own, last.
 */
export const legendGroups = (rows: readonly ExplorerRow[], field: Field, filters: Filters): LegendGroup[] => {
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
