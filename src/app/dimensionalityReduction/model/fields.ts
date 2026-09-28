/** The fields samples can be colored and filtered by, and how their values are grouped, named, ordered and colored. */

import { age_bin_color_map, AGE_BIN_LABELS } from "@/common/ageBins";
import {
  protocol_color_map,
  sex_color_map,
  site_color_map,
  status_color_map,
  VALUE_LABEL_OVERRIDES,
} from "@/common/colors";
import { NEUTRAL_DARK, NEUTRAL_MID } from "@/common/components/plotDimming";
import { FEATURE_KINDS, isFeatureColor, type FeatureColor, type FeatureKind } from "./features";
import { METRICS, isMetric, type Metric } from "./metrics";
import { OME_CAPABILITIES, type ExplorerOme } from "./omes";
import type { ExplorerRow } from "./types";

/**
 * In the order the controls list them. `key` is what a link carries (?color=age) - see ROW_KEYS for
 * the row property behind it. Age isn't shapeable: its nine bins are more than the shape scale
 * holds, and they're ordered, which only a color ramp shows.
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

/** All of them, less protocol wherever it doesn't vary. */
export const fieldsFor = (ome: ExplorerOme): FieldDefinition[] =>
  FIELDS.filter(({ key }) => key !== "protocol" || OME_CAPABILITIES[ome].protocol);

/** A field, one of ATAC's library metrics, or one feature's quantification. */
export type ColorBy = Field | Metric | FeatureColor;

export const isColorBy = (value: string | null): value is ColorBy =>
  isField(value) || isMetric(value) || isFeatureColor(value);

/** The colorings drawn on a ramp with a colorbar, rather than as groups with chips and filters. */
export const isContinuous = (color: ColorBy) => isMetric(color) || isFeatureColor(color);

export type ColorOptions = {
  fields: FieldDefinition[];
  /** Empty on an ome with no metrics. */
  metrics: readonly (typeof METRICS)[number][];
  /** The kind of feature that can color this ome, if any. */
  feature: FeatureKind | null;
};

export const colorOptionsFor = (ome: ExplorerOme): ColorOptions => ({
  fields: fieldsFor(ome),
  metrics: OME_CAPABILITIES[ome].metrics ? METRICS : [],
  feature: OME_CAPABILITIES[ome].feature,
});

/** Whether an ome offers a coloring: what a hand-edited ?color=, or one carried over from another ome, is held to. */
export const offersColor = (ome: ExplorerOme, color: ColorBy) => {
  const { fields, metrics, feature } = colorOptionsFor(ome);
  return isFeatureColor(color)
    ? feature !== null && FEATURE_KINDS[feature].color === color
    : [...fields, ...metrics].some(({ key }) => key === color);
};

/** "Site", "TSS enrichment", "Lipid abundance". The explorer names a picked feature itself. */
export const colorLabel = (ome: ExplorerOme, color: ColorBy) => {
  const { fields, metrics, feature } = colorOptionsFor(ome);
  if (isFeatureColor(color)) return feature ? FEATURE_KINDS[feature].option : "Feature";
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
 * Where every QC and reference sample goes, whatever the field: they're not a participant's, so
 * have no site, status, sex or age. One group reads the same on every legend, and is faded with one
 * switch rather than a filter per field.
 */
export const QC_GROUP = "QC / Reference";

/** A participant's sample with no value recorded for the field. */
const UNKNOWN_GROUP = "Unknown";

/** Groups colored neutral, drawn beneath the rest and listed after them. */
export const isNeutralGroup = (value: string) => value === QC_GROUP || value === UNKNOWN_GROUP;

export const groupOf = (field: Field, row: ExplorerRow): string => {
  if (row.qc) return QC_GROUP;
  const value = row[ROW_KEYS[field]];
  // A recorded "unknown" means the same as no value, and its palette grey would read as faded.
  return !value || value.toLowerCase() === UNKNOWN_GROUP.toLowerCase() ? UNKNOWN_GROUP : value;
};

/** The app's color maps, so a value is the same color here as on every ome page. */
const PALETTES: Record<Field, Record<string, string>> = {
  site: site_color_map,
  status: status_color_map,
  sex: sex_color_map,
  age: age_bin_color_map,
  protocol: protocol_color_map,
};

/**
 * For a value no palette knows yet. Blue-grey, so it can't pass for a faded point, though it's only
 * ~14 ΔE2000 from NEUTRAL_DARK against ~15 elsewhere. Nothing reaches it today.
 */
const UNMAPPED_COLOR = "#37474F";

/** The neutral groups take the shared grey scale's two steps, distinct from each other and from a faded point. */
export const colorOf = (field: Field, value: string): string => {
  if (value === QC_GROUP) return NEUTRAL_DARK;
  if (value === UNKNOWN_GROUP) return NEUTRAL_MID;
  return PALETTES[field][value] ?? UNMAPPED_COLOR;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** A value as the controls and legend show it. Display only: the raw value stays the group's key. */
export const labelOf = (field: Field, value: string): string => {
  if (isNeutralGroup(value)) return value;
  switch (field) {
    case "status":
      return capitalize(value);
    case "sex":
      return VALUE_LABEL_OVERRIDES[value] ?? capitalize(value);
    case "protocol":
      return value.replace(/ method$/, "");
    default:
      return value;
  }
};

/** Distinct values: age by band, the rest alphabetically, neutral groups last. Never by count, so order holds across omes. */
export const sortValues = (field: Field, values: Iterable<string>): string[] => {
  const band = (value: string) => {
    const index = AGE_BIN_LABELS.indexOf(value);
    return field === "age" && index !== -1 ? index : AGE_BIN_LABELS.length;
  };
  return [...new Set(values)].sort(
    (a, b) => Number(isNeutralGroup(a)) - Number(isNeutralGroup(b)) || band(a) - band(b) || a.localeCompare(b)
  );
};
