/**
 * The fields samples can be colored and filtered by, and how each field's values are grouped,
 * named, ordered and colored.
 */

import { protocol_color_map, sex_color_map, site_color_map, status_color_map } from "@/common/colors";
import { NEUTRAL_DARK, NEUTRAL_MID } from "@/common/components/plotDimming";
import { EXPRESSION_COLOR, type ExpressionColor } from "./expression";
import { METRICS, isMetric, type Metric } from "./metrics";
import { OME_CAPABILITIES, type ExplorerOme } from "./omes";
import type { ExplorerRow } from "./types";

/**
 * In the order the controls list them. `key` is what a link carries (?color=age), so it names the
 * field rather than the row property behind it - see ROW_KEYS.
 *
 * `shapeable` is whether the field can also be encoded as point shape. Shape is an unordered
 * encoding of few categories, which age is neither: its nine bins are more than the shape scale
 * holds, and they are a ranked scale that only reads as categorical because we bin it for privacy.
 * Shaping by it would throw that order away and ask the reader to tell nine glyphs apart at four
 * pixels. Color keeps age, where a ramp carries the order.
 */
export const FIELDS = [
  { key: "site", label: "Site", shapeable: true },
  { key: "status", label: "Status", shapeable: true },
  { key: "sex", label: "Sex", shapeable: true },
  { key: "age", label: "Age", shapeable: false },
  { key: "protocol", label: "Protocol", shapeable: true },
] as const;

export type FieldDefinition = (typeof FIELDS)[number];

export type Field = FieldDefinition["key"];

export const isField = (value: string | null): value is Field => FIELDS.some(({ key }) => key === value);

/** The fields an ome offers: all of them, less protocol wherever it does not vary. */
export const fieldsFor = (ome: ExplorerOme): FieldDefinition[] =>
  FIELDS.filter(({ key }) => key !== "protocol" || OME_CAPABILITIES[ome].protocol);

/**
 * Anything the plot can be colored by: a field, on ATAC one of its library metrics, and on RNA the
 * expression of one gene.
 */
export type ColorBy = Field | Metric | ExpressionColor;

export const isColorBy = (value: string | null): value is ColorBy =>
  isField(value) || isMetric(value) || value === EXPRESSION_COLOR;

/**
 * The colorings that carry a ramp and a colorbar rather than groups and chips. What separates them
 * from the fields is not the data type but the legend and the filters: neither has values to toggle.
 */
export const isContinuous = (color: ColorBy) => isMetric(color) || color === EXPRESSION_COLOR;

export type ColorOptions = {
  fields: FieldDefinition[];
  /** Empty on an ome with no metrics. */
  metrics: readonly (typeof METRICS)[number][];
  /** Whether a gene's expression is on offer. The gene itself is state, not an option - see params.ts. */
  expression: boolean;
};

export const colorOptionsFor = (ome: ExplorerOme): ColorOptions => ({
  fields: fieldsFor(ome),
  metrics: OME_CAPABILITIES[ome].metrics ? METRICS : [],
  expression: OME_CAPABILITIES[ome].expression,
});

/** Whether an ome offers a coloring at all, which is what a hand-edited ?color= is held to. */
export const offersColor = (ome: ExplorerOme, color: ColorBy) => {
  const { fields, metrics, expression } = colorOptionsFor(ome);
  return color === EXPRESSION_COLOR ? expression : [...fields, ...metrics].some(({ key }) => key === color);
};

/**
 * "Site", "TSS enrichment" - the name of whatever the plot is colored by. Gene expression is named
 * by its gene wherever one is in hand, which is the explorer's to say and not this file's.
 */
export const colorLabel = (ome: ExplorerOme, color: ColorBy) => {
  if (color === EXPRESSION_COLOR) return "Gene expression";
  const { fields, metrics } = colorOptionsFor(ome);
  return [...fields, ...metrics].find(({ key }) => key === color)?.label ?? color;
};

const ROW_KEYS = {
  site: "site",
  status: "status",
  sex: "sex",
  age: "age_bin",
  protocol: "protocol",
} as const satisfies Record<Field, keyof ExplorerRow>;

/**
 * The group every QC and reference sample falls into, whichever field the plot is colored by.
 *
 * They are not a participant's samples, so they have no site, status, sex or age to be grouped
 * by. Spreading them across a "Missing" on one legend and an "Experimental Control" on another -
 * which also reads too much like the real "control" status - would make the same samples look
 * like different ones as the coloring changes. One neutral group means the same thing everywhere,
 * and whether it is faded is one switch rather than a filter on every field.
 */
export const QC_GROUP = "QC / Reference";

/** The group for a participant's sample with no value recorded for a field. */
export const UNKNOWN_GROUP = "Unknown";

/** Groups that take a neutral rather than a palette color, are drawn beneath the rest, and are listed after them. */
export const isNeutralGroup = (value: string) => value === QC_GROUP || value === UNKNOWN_GROUP;

export const groupOf = (field: Field, row: ExplorerRow): string => {
  if (row.qc) return QC_GROUP;
  const value = row[ROW_KEYS[field]];
  // A recorded "unknown" says what no value at all says, and the app's status palette paints it a
  // light grey that now reads as a faded-out point. Both go to the one group.
  return !value || value.toLowerCase() === UNKNOWN_GROUP.toLowerCase() ? UNKNOWN_GROUP : value;
};

/** The bins the API's age_bin takes, youngest first. */
export const AGE_BINS = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"];

/**
 * The age ramp from src/common/ageBins.ts (AGE_BIN_RAMP), one color per bin by position.
 *
 * Copied rather than imported: that file bins age_at_enrollment on our side, and should go when
 * that field does. Its edges are not the API's (<20 ... 90+ against 0-9 ... 80+), but both have
 * nine bins, and what the ramp encodes is their order - so it carries across as it is.
 */
const AGE_BIN_COLORS: Record<string, string> = {
  "0-9": "#1e3a8a",
  "10-19": "#2d68ab",
  "20-29": "#3b94b4",
  "30-39": "#47a988",
  "40-49": "#7abc62",
  "50-59": "#c4cc52",
  "60-69": "#f1c248",
  "70-79": "#ec893f",
  "80+": "#d9502a",
};

/**
 * Site, status, sex and protocol share the app's color maps, so a site is the same color here as
 * on every ome page.
 */
const PALETTES: Record<Field, Record<string, string>> = {
  site: site_color_map,
  status: status_color_map,
  sex: sex_color_map,
  age: AGE_BIN_COLORS,
  protocol: protocol_color_map,
};

/**
 * For a value no palette knows yet, a site added in a later release say. Blue-grey rather than grey,
 * so it cannot pass for a faded point - though at ~14 ΔE2000 from the neutral below it is the one
 * color on the page that does not quite clear the ~15 kept everywhere else. Nothing reaches it
 * today; move it off the dark end rather than widen it if a value ever does.
 */
const UNMAPPED_COLOR = "#37474F";

/**
 * The two neutral groups take the two steps of the shared grey scale - a missing value the lighter,
 * a sample that is not a participant's the darker - so that neither can be mistaken for the other
 * or for a point the filters have faded out.
 */
export const colorOf = (field: Field, value: string): string => {
  if (value === QC_GROUP) return NEUTRAL_DARK;
  if (value === UNKNOWN_GROUP) return NEUTRAL_MID;
  return PALETTES[field][value] ?? UNMAPPED_COLOR;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** A value as the controls and legend show it. Display only: the raw value stays the group's identity. */
export const labelOf = (field: Field, value: string): string => {
  if (isNeutralGroup(value)) return value;
  switch (field) {
    case "status":
    case "sex":
      return capitalize(value);
    case "protocol":
      return value.replace(/ method$/, "");
    default:
      return value;
  }
};

/**
 * Distinct values in display order: age by band, everything else alphabetically, the neutral groups
 * last. Never by count - a value then holds its place as you move between omes.
 */
export const sortValues = (field: Field, values: Iterable<string>): string[] => {
  const band = (value: string) => {
    const index = AGE_BINS.indexOf(value);
    return field === "age" && index !== -1 ? index : AGE_BINS.length;
  };
  return [...new Set(values)].sort(
    (a, b) => Number(isNeutralGroup(a)) - Number(isNeutralGroup(b)) || band(a) - band(b) || a.localeCompare(b)
  );
};
