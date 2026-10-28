/**
 * Grouping for the PCA plots: one field on a row becomes the ordered, counted,
 * labeled and colored list of groups the legend renders and the plot colors by.
 *
 * The per-field tables this reads - which palette and which labels a field gets,
 * and which fallback pool its cohort draws from - are declared in fields.ts. What
 * lives here is the algorithm.
 */

import { NEUTRAL_DARK } from "@/common/neutralColors";
import { shapeScaleOf, type ShapeScale } from "@/common/components/pointShapes";
import { FIELD_LABELS, FIELD_PALETTES, fallbackPalette, type ColorField, type Palette } from "./fields";
import { PRIVACY_BIN, PRIVACY_BIN_COLOR } from "./privacy";
import { VALUE_LABEL_OVERRIDES } from "@/common/colors";

/**
 * The dark end of the shared neutral scale, not the light gray this used to be: filtered-out points
 * are now drawn pale gray, and a stack of them landed on the old #C7C7C7 exactly (0.0 ΔE2000).
 *
 * The dark end rather than the middle one because the privacy bin's slate is already there, 7
 * ΔE2000 away, and the two share the reported race/ethnicity legend. Moving the bin instead would
 * walk back the reason it is slate at all - see PRIVACY_BIN_COLOR.
 */
const UNKNOWN_COLOR = NEUTRAL_DARK;

/**
 * Legend position for the two groups that are not categories. The privacy bin and
 * "Unknown" sort after everything the reader is actually comparing, whatever
 * their counts, so neither drifts into the middle of the ordering as a release
 * fills out.
 */
const rank = (value: string) => (value === "Unknown" ? 2 : value === PRIVACY_BIN ? 1 : 0);

export type GroupInfo = {
  /**
   * The group's identity: the raw field value, or "Unknown". Everything keyed by
   * a group - the hidden set, the hover highlight, the palettes - keys on this,
   * so it is what the plot and the legend pass around, never `label`.
   */
  value: string;
  /** What the legend shows for it. Falls back to `value` where there is no mapping. */
  label: string;
  color: string;
  count: number;
  /**
   * For the privacy bin, the categories folded into it - what its chip names on
   * hover. Undefined on every other group.
   */
  members?: string[];
};

/** Normalizes a raw field value to the group label used by buildGroups. */
export const groupValue = (raw: unknown): string =>
  raw === null || raw === undefined || raw === "" ? "Unknown" : String(raw);

/**
 * A field value as the reader should see it - "AFR" reaches the legend as
 * "African". Display only: the value itself stays the group's identity.
 *
 * Takes the raw value rather than a normalized one so the tooltip, which reads
 * straight off a row, can use the same lookup the legend does.
 */
export const displayValue = (key: ColorField, raw: unknown): string => {
  const value = groupValue(raw);
  return FIELD_LABELS[key]?.[value] ?? VALUE_LABEL_OVERRIDES[value] ?? value;
};

/**
 * Builds the ordered group list for a field, with a color for each.
 * Rows whose value is null are collected under "Unknown".
 */
export const buildGroups = <T>(
  rows: T[],
  key: keyof T & ColorField,
  /**
   * Categories folded into the privacy bin, attached to its group so the legend
   * gets them through `groups` rather than a prop threaded past two components
   * that have no use for them. Ignored for every field but the binned one, which
   * is the only one a PRIVACY_BIN group can appear in.
   */
  binMembers: string[] = []
): GroupInfo[] => {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = groupValue(row[key]);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  // By descending count, after the privacy bin and "Unknown" are set apart - see rank.
  const ordered = [...counts.keys()].sort(
    (a, b) => rank(a) - rank(b) || (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b)
  );

  const palette: Palette = FIELD_PALETTES[key] ?? {};

  // Per cohort, not one shared pool: the reference and MOHD plots are on screen
  // at once, and a color they had in common would invite the reader to pair the
  // groups that carry it. See the two lists in fields.ts.
  const fallback = fallbackPalette(key);

  // The cursor advances only for groups the palette did not answer for, so an
  // uncovered value takes the next qualitative color in sequence rather than
  // whatever sits at its position in the legend - indexing by position is how
  // "prefer no answer" used to come out the same green as "male".
  let cursor = 0;

  return ordered.map((value) => ({
    value,
    label: displayValue(key, value),
    count: counts.get(value) ?? 0,
    members: value === PRIVACY_BIN ? binMembers : undefined,
    // The bin is answered before the qualitative fallback so it takes its own
    // color without advancing the cursor past a real category's.
    color:
      palette[value] ??
      (value === PRIVACY_BIN
        ? PRIVACY_BIN_COLOR
        : value === "Unknown"
          ? UNKNOWN_COLOR
          : fallback[cursor++ % fallback.length]),
  }));
};

/** The same groups, in the same order and colors, counted over the rows another legend's filter leaves in. */
export const recount = <T>(groups: GroupInfo[], rows: T[], key: keyof T & ColorField): GroupInfo[] => {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = groupValue(row[key]);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return groups.map((group) => ({ ...group, count: counts.get(group.value) ?? 0 }));
};

/**
 * Which shape each of a field's values takes, or null where there are more values than shapes.
 * Alphabetical rather than by count, so a value keeps its shape as a release fills out - and each
 * site, status and sex takes the same shape here as on the other dimensionality reduction plots.
 * The privacy bin comes after them, so whether a release has one can't move the others; "Unknown"
 * has no value, and stays a circle.
 */
export const shapeScaleFor = <T>(rows: T[], key: keyof T & ColorField): ShapeScale | null => {
  const values = new Set(rows.map((row) => groupValue(row[key])));
  return shapeScaleOf([
    ...[...values].filter((value) => value !== "Unknown" && value !== PRIVACY_BIN).sort((a, b) => a.localeCompare(b)),
    ...(values.has(PRIVACY_BIN) ? [PRIVACY_BIN] : []),
  ]);
};
