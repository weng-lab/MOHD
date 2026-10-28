import type { GridFilterModel } from "@mui/x-data-grid-premium";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";
import { QC_GROUP, UNKNOWN_GROUP, fieldOfColumn, sortValues } from "@/common/sampleFields/fields";

/**
 * How a download is described in its analytics event (see trackDownload). Each description is
 * canonical - the same download always reads the same - so the dashboard counts like with like.
 * No React here.
 */

/**
 * "all" when a download holds every type of open file the ome has, or the types it holds, sorted
 * and joined with " | ", as the labels have commas of their own. Sorted by code unit: a locale's
 * order would vary with the browser.
 */
export function fileTypesOf(types: Iterable<string>, openTypes: ReadonlySet<string>): string {
  const held = new Set(types);
  if ([...openTypes].every((type) => held.has(type))) return "all";
  return [...held].sort().join(" | ");
}

/**
 * The Datasets table's search as typed, lowercased with single spaces, or null without one. The
 * grid keeps it split into words.
 */
export const searchOf = ({ quickFilterValues }: GridFilterModel): string | null =>
  quickFilterValues?.join(" ").replace(/\s+/g, " ").trim().toLowerCase() || null;

/** A field's value as the downloads table groups it: a QC sample's is QC / Reference in every field. */
const valueOf = (dataset: BaseSampleMetadata, column: string): string =>
  dataset.status === QC_GROUP ? QC_GROUP : String(dataset[column] || UNKNOWN_GROUP);

/** A field's name in a subset: its key on every other page, so age_bin reads "age". */
const nameOf = (column: string): string => fieldOfColumn(column) ?? column;

/** column -> the values a slice allows in it. A column not in it is unconstrained. */
type Slice = Map<string, ReadonlySet<string>>;

const sizeOf = (slice: Slice, universe: readonly BaseSampleMetadata[]): number =>
  universe.filter((dataset) => [...slice].every(([column, values]) => values.has(valueOf(dataset, column)))).length;

/** "sex=female", or "status!=QC / Reference" where naming the values left out is shorter. */
function describeField(column: string, values: ReadonlySet<string>, universe: readonly BaseSampleMetadata[]): string {
  const field = fieldOfColumn(column);
  const sorted = (list: Iterable<string>) => (field ? sortValues(field, list) : [...new Set(list)].sort());
  const name = nameOf(column);
  const included = `${name}=${sorted(values).join(",")}`;
  const others = universe.map((dataset) => valueOf(dataset, column)).filter((value) => !values.has(value));
  const excluded = `${name}!=${sorted(others).join(",")}`;
  return excluded.length < included.length ? excluded : included;
}

/**
 * Which slice of an ome's datasets a selection is, e.g. "all of sex=female; site=UIC-DKD".
 *
 * The slice starts as the values the selection holds in each field, then loses each field,
 * alphabetically, that narrows nothing the rest don't. "all of" when the selection is that whole
 * slice and "part of" when it's only some of it; "all" alone when it's the whole `universe`, every
 * dataset with an open file. A selection whose values span every field is "part of all".
 */
export function subsetOf(
  selected: ReadonlySet<string>,
  universe: readonly BaseSampleMetadata[],
  columns: readonly string[]
): string {
  const chosen = universe.filter((dataset) => selected.has(dataset.sample_id));
  if (chosen.length === universe.length) return "all";

  const byName = [...columns].sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
  let slice: Slice = new Map(byName.map((column) => [column, new Set(chosen.map((d) => valueOf(d, column)))]));
  const size = sizeOf(slice, universe);
  for (const column of byName) {
    const wider = new Map(slice);
    wider.delete(column);
    // Dropping a field can only add datasets, so an unchanged count is an unchanged slice.
    if (sizeOf(wider, universe) === size) slice = wider;
  }

  const fields = [...slice].map(([column, values]) => describeField(column, values, universe)).join("; ");
  return `${size === chosen.length ? "all" : "part"} of ${fields || "all"}`;
}
