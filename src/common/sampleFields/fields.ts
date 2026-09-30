/**
 * The fields samples can be colored, shaped and filtered by on any page, and how their values are
 * grouped, named, ordered and colored.
 */

import { age_bin_color_map, AGE_BIN_LABELS } from "@/common/ageBins";
import {
  protocol_color_map,
  sex_color_map,
  site_color_map,
  status_color_map,
  VALUE_LABEL_OVERRIDES,
} from "@/common/colors";
import { NEUTRAL_DARK, NEUTRAL_MID } from "@/common/components/plotDimming";
import type { OmesDataType } from "@/common/types/globalTypes";

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

/** The omes whose samples were taken by more than one protocol: every other ome has one throughout. */
const VARIED_PROTOCOL_OMES: readonly OmesDataType[] = ["ATAC"];

/** The omes the API records no age for, so an Age column would read "Unknown" for everyone. */
const AGELESS_OMES: readonly OmesDataType[] = ["exposomics"];

/** All of them, less protocol wherever it doesn't vary and age wherever there is none. */
export const fieldsFor = (ome: OmesDataType): FieldDefinition[] =>
  FIELDS.filter(
    ({ key }) =>
      (key !== "protocol" || VARIED_PROTOCOL_OMES.includes(ome)) && (key !== "age" || !AGELESS_OMES.includes(ome))
  );

/** What a sample's groups are read from: any page's row, with `qc` set by isQcKit. */
export type SampleGroups = {
  sample_id: string;
  qc: boolean;
  site?: string | null;
  status?: string | null;
  sex?: string | null;
  /** Binned by the API ("0-9" ... "80+"). Raw age is sensitive and never fetched. */
  age_bin?: string | null;
  protocol?: string | null;
};

const ROW_KEYS = {
  site: "site",
  status: "status",
  sex: "sex",
  age: "age_bin",
  protocol: "protocol",
} as const satisfies Record<Field, keyof SampleGroups>;

/** The table column holding a field. */
export const columnOf = (field: Field) => ROW_KEYS[field];

/** The field a table column holds, if it holds one. */
export const fieldOfColumn = (column: string): Field | undefined =>
  FIELDS.find(({ key }) => ROW_KEYS[key] === column)?.key;

/** Kits the API gives QC and reference material rather than a participant's sample. */
const QC_KITS = new Set(["internal_QC", "external_QC", "reference"]);

export const isQcKit = (kit: string | null | undefined) => QC_KITS.has(kit ?? "");

/** A sample as the API returns it, which tells QC material apart only by its kit. */
export type SampleRow = Omit<SampleGroups, "qc"> & { kit?: string | null };

export const toSample = <R extends SampleRow>(row: R): R & SampleGroups => ({ ...row, qc: isQcKit(row.kit) });

/**
 * A quantification row, which the API returns without a kit. Its QC samples are the ones with no
 * status: checked against each ome's metadata (2026-09-28), every QC-kit sample has none, and every
 * other sample has one.
 */
export const toQuantificationSample = <R extends Omit<SampleGroups, "qc">>(row: R): R & SampleGroups => ({
  ...row,
  qc: !row.status,
});

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

export const groupOf = (field: Field, row: SampleGroups): string => {
  if (row.qc) return QC_GROUP;
  const value = row[ROW_KEYS[field]];
  // A recorded "unknown" means the same as no value, and its palette gray would read as faded.
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
 * For a value no palette knows yet. Blue-gray, so it can't pass for a faded point, though it's only
 * ~14 ΔE2000 from NEUTRAL_DARK against ~15 elsewhere. Nothing reaches it today.
 */
const UNMAPPED_COLOR = "#37474F";

/** The neutral groups take the shared gray scale's two steps, distinct from each other and from a faded point. */
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
