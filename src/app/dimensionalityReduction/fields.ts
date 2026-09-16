/**
 * The fields samples can be colored and filtered by, and how each field's values are grouped,
 * named, ordered and colored.
 */

import { CONTROL_COLOR, protocol_color_map, sex_color_map, site_color_map, status_color_map } from "@/common/colors";
import { OME_CAPABILITIES, type ExplorerOme } from "./omes";
import type { ExplorerRow } from "./types";

/**
 * In the order the controls list them. `key` is what a link carries (?color=age), so it names the
 * field rather than the row property behind it - see ROW_KEYS.
 */
export const FIELDS = [
  { key: "site", label: "Site" },
  { key: "status", label: "Status" },
  { key: "sex", label: "Sex" },
  { key: "age", label: "Age" },
  { key: "protocol", label: "Protocol" },
] as const;

export type FieldDefinition = (typeof FIELDS)[number];

export type Field = FieldDefinition["key"];

export const isField = (value: string | null): value is Field => FIELDS.some(({ key }) => key === value);

/** The fields an ome offers: all of them, less protocol wherever it does not vary. */
export const fieldsFor = (ome: ExplorerOme): FieldDefinition[] =>
  FIELDS.filter(({ key }) => key !== "protocol" || OME_CAPABILITIES[ome].protocol);

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
 * like different ones as the coloring changes. One grey group means the same thing everywhere,
 * and whether it shows is one switch rather than a filter on every field.
 */
export const QC_GROUP = "QC / Reference";

/** The group for a participant's sample with no value recorded for a field. */
export const UNKNOWN_GROUP = "Unknown";

/** Groups that are drawn grey, beneath the rest, and listed after them. */
export const isGreyGroup = (value: string) => value === QC_GROUP || value === UNKNOWN_GROUP;

export const groupOf = (field: Field, row: ExplorerRow): string =>
  row.qc ? QC_GROUP : (row[ROW_KEYS[field]] ?? UNKNOWN_GROUP);

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

/** For a value no palette knows yet, a site added in a later release say. Dark, so it cannot pass for grey. */
const UNMAPPED_COLOR = "#37474F";

export const colorOf = (field: Field, value: string): string =>
  isGreyGroup(value) ? CONTROL_COLOR : (PALETTES[field][value] ?? UNMAPPED_COLOR);

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** A value as the controls and legend show it. Display only: the raw value stays the group's identity. */
export const labelOf = (field: Field, value: string): string => {
  if (isGreyGroup(value)) return value;
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
 * Distinct values in display order: age by band, everything else alphabetically, the grey groups
 * last. Never by count - a value then holds its place as you move between omes.
 */
export const sortValues = (field: Field, values: Iterable<string>): string[] => {
  const band = (value: string) => {
    const index = AGE_BINS.indexOf(value);
    return field === "age" && index !== -1 ? index : AGE_BINS.length;
  };
  return [...new Set(values)].sort(
    (a, b) => Number(isGreyGroup(a)) - Number(isGreyGroup(b)) || band(a) - band(b) || a.localeCompare(b)
  );
};
