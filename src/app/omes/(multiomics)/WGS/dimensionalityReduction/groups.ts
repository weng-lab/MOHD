/**
 * Grouping for the PCA plots: one field on a row becomes the ordered, counted,
 * labelled and colored list of groups the legend renders and the plot colors by.
 *
 * The per-field tables this reads - which palette and which labels a field gets -
 * are declared in fields.ts. What lives here is the algorithm, and the fallbacks
 * for whatever those tables do not answer for: a qualitative palette for
 * unordered values, and a sequential ramp for ordered ones (the age bands), so
 * that where an ordering exists it reads off the color.
 */

import { FIELD_LABELS, FIELD_PALETTES, type ColorField, type Palette } from "./fields";
import { PRIVACY_BIN, PRIVACY_BIN_COLOR } from "./privacy";

/** Fallback qualitative palette for values no field palette covers. */
const QUALITATIVE = [
  "#E41A1C", "#377EB8", "#4DAF4A", "#984EA3", "#FF7F00",
  "#A65628", "#F781BF", "#17BECF", "#BCBD22", "#999999",
];

const UNKNOWN_COLOR = "#C7C7C7";

/** Sequential ramp (YlOrBr-like), interpolated for however many bands exist. */
const RAMP: [number, number, number][] = [
  [255, 247, 188],
  [254, 153, 41],
  [127, 39, 4],
];

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

const sequentialColor = (index: number, count: number): string => {
  if (count <= 1) return `rgb(${RAMP[1].join(",")})`;
  const t = (index / (count - 1)) * (RAMP.length - 1);
  const i = Math.min(Math.floor(t), RAMP.length - 2);
  const [from, to] = [RAMP[i], RAMP[i + 1]];
  const f = t - i;
  return `rgb(${lerp(from[0], to[0], f)},${lerp(from[1], to[1], f)},${lerp(from[2], to[2], f)})`;
};

/** True when every value is an age band ("40-49", "80+"). "Unknown" is not one. */
const isAgeBand = (values: string[]) => values.every((v) => /^\d+(-\d+|\+)$/.test(v));

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

/** Normalises a raw field value to the group label used by buildGroups. */
export const groupValue = (raw: unknown): string =>
  raw === null || raw === undefined || raw === "" ? "Unknown" : String(raw);

/**
 * A field value as the reader should see it - "AFR" reaches the legend as
 * "African". Display only: the value itself stays the group's identity.
 *
 * Takes the raw value rather than a normalised one so the tooltip, which reads
 * straight off a row, can use the same lookup the legend does.
 */
export const displayValue = (key: ColorField, raw: unknown): string => {
  const value = groupValue(raw);
  return FIELD_LABELS[key]?.[value] ?? value;
};

/**
 * Builds the ordered group list for a field, with a color for each.
 * Rows whose value is null are collected under "Unknown".
 */
export const buildGroups = <T,>(
  rows: T[],
  key: keyof T & ColorField,
  /**
   * Categories folded into the privacy bin, attached to its group so the legend
   * gets them through `groups` rather than a prop threaded past two components
   * that have no use for them. Ignored for every field but the binned one, which
   * is the only one a PRIVACY_BIN group can appear in.
   */
  binMembers: string[] = [],
): GroupInfo[] => {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = groupValue(row[key]);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  // "Unknown" is held out of the age test, and of the ordering and ramp that
  // follow from it. It is not a band, so leaving it in used to make one missing
  // age enough to fail the test: the field then fell back to count order while
  // the ramp was still applied over it, and the age scale came out scrambled.
  const values = [...counts.keys()];
  const bands = values.filter((v) => v !== "Unknown");
  const sequential = isAgeBand(bands);

  // Age bands sort numerically, with any "Unknown" pinned after them - it has no
  // position on the scale, and parseInt("Unknown") is NaN, which would leave the
  // whole comparator, and so the whole legend order, undefined. Everything else
  // sorts by descending count, "Unknown" included.
  const ordered = sequential
    ? [...bands.sort((a, b) => parseInt(a, 10) - parseInt(b, 10)), ...(counts.has("Unknown") ? ["Unknown"] : [])]
    : values.sort(
        (a, b) => rank(a) - rank(b) || (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b),
      );

  const palette: Palette = FIELD_PALETTES[key] ?? {};

  // The cursor advances only for groups the palette did not answer for, so an
  // uncovered value takes the next qualitative color in sequence rather than
  // whatever sits at its position in the legend - indexing by position is how
  // "prefer no answer" used to come out the same green as "male".
  let cursor = 0;

  return ordered.map((value, i) => ({
    value,
    label: displayValue(key, value),
    count: counts.get(value) ?? 0,
    members: value === PRIVACY_BIN ? binMembers : undefined,
    // The palette wins even for "Unknown" - the status map names its own grey.
    // The bin is answered before the qualitative fallback so it takes its own
    // color without advancing the cursor past a real category's.
    color:
      palette[value] ??
      (value === PRIVACY_BIN
        ? PRIVACY_BIN_COLOR
        : value === "Unknown"
          ? UNKNOWN_COLOR
          : sequential
            ? // Ramped across the bands alone; "Unknown" sorts after them, so a
              // band's legend index is its band index.
              sequentialColor(i, bands.length)
            : QUALITATIVE[cursor++ % QUALITATIVE.length]),
  }));
};
