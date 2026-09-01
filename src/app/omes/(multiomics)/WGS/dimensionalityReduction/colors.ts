/**
 * Colour assignment for the PCA plots.
 *
 * MOHD fields reuse the palettes in src/common/colors.ts, so a site or a case
 * status is the same colour here as it is anywhere else in the app. The
 * reference cohort's fields are external to this project and have no repo-wide
 * convention, so they fall back to a local palette. Ordered groups (the age
 * bands) get a sequential ramp instead, so the ordering reads off the colour.
 */

import { sex_color_map, site_color_map, status_color_map } from "@/common/colors";

/**
 * 1000G+HGDP super populations (ColorBrewer Set1). A reference-panel
 * convention rather than a MOHD one, so it lives here and not in the shared map.
 */
const SUPERPOP_COLORS: Record<string, string> = {
  AFR: "#984EA3",
  EUR: "#377EB8",
  CSA: "#FF7F00",
  MID: "#A65628",
  OCE: "#999999",
  EAS: "#4DAF4A",
  AMR: "#E41A1C",
};

type Palette = Record<string, string | undefined>;

/**
 * The palette to use for each colour-by field, keyed by its name on the row.
 * Anything not listed here falls back to QUALITATIVE.
 *
 * Reference `sex` shares sex_color_map with MOHD `sex_at_birth` on purpose: the
 * two plots sit side by side, so male and female have to agree across them.
 */
const FIELD_PALETTES: Record<string, Palette | undefined> = {
  case_status: status_color_map,
  site: site_color_map,
  sex_at_birth: sex_color_map,
  sex: sex_color_map,
  superpop: SUPERPOP_COLORS,
};

/** Fallback qualitative palette for everything else. */
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

/** Age bands sort numerically ("80+" last); everything else by descending count. */
const isAgeBand = (values: string[]) => values.every((v) => /^\d+(-\d+|\+)$/.test(v));

const orderGroups = (counts: Map<string, number>): string[] => {
  const values = [...counts.keys()];
  if (isAgeBand(values)) {
    return values.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }
  return values.sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b));
};

export type GroupInfo = { value: string; color: string; count: number };

/**
 * Builds the ordered group list for a field, with a colour for each.
 * Rows whose value is null are collected under "Unknown".
 */
export const buildGroups = <T,>(rows: T[], key: keyof T): GroupInfo[] => {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const raw = row[key];
    const value = raw === null || raw === undefined || raw === "" ? "Unknown" : String(raw);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const ordered = orderGroups(counts);
  const sequential = isAgeBand(ordered.filter((v) => v !== "Unknown"));
  const palette = FIELD_PALETTES[String(key)] ?? {};

  // The cursor advances only for groups the palette did not answer for, so an
  // uncovered value takes the next qualitative colour in sequence rather than
  // whatever sits at its position in the legend - indexing by position is how
  // "prefer no answer" used to come out the same green as "male".
  let cursor = 0;

  return ordered.map((value, i) => ({
    value,
    count: counts.get(value) ?? 0,
    // The palette wins even for "Unknown" - the status map names its own grey.
    color:
      palette[value] ??
      (value === "Unknown"
        ? UNKNOWN_COLOR
        : sequential
          ? sequentialColor(i, ordered.length)
          : QUALITATIVE[cursor++ % QUALITATIVE.length]),
  }));
};

/** Normalises a raw field value to the group label used by buildGroups. */
export const groupValue = (raw: unknown): string =>
  raw === null || raw === undefined || raw === "" ? "Unknown" : String(raw);
