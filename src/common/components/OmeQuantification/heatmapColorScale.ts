import { formatValue, formatValueBound, fromLogValue, toLogValue } from "@/common/quantification";
import {
  CLIP_PERCENTILE,
  SEQUENTIAL_RAMP,
  defaultRange,
  percentilePresets,
  reachOf,
  symmetricPresets,
  type ColorRange,
  type RampKind,
  type RangePreset,
} from "@/common/components/Colorbar/colorbarAxis";
import { zScoreByRow } from "./zScoreByRow";

/**
 * Ways to color an ome's quantification heatmap:
 * - "zscore": each row z-scored on log10(value + 1) across every sample, from ±3.
 * - "rawZscore": the same on raw values, so switching shows what the log does. Right-skewed: high
 *   outliers stand out (to +33 on metabolomics) where the log spreads the low ones.
 * - "log": log10(value + 1) on one scale for every cell, from the middle 96%. For exposomics, where
 *   most molecules are detected in few samples, so whether one was detected at all is the signal.
 */
export type HeatmapScaleMode = "zscore" | "rawZscore" | "log";

/** Named by the formula each is taken on, and whether it's then z-scored. */
export const HEATMAP_SCALES: Record<HeatmapScaleMode, { formula: string; zScored: boolean }> = {
  zscore: { formula: "log10(value + 1)", zScored: true },
  rawZscore: { formula: "value", zScored: true },
  log: { formula: "log10(value + 1)", zScored: false },
};

/** The toggle's options on the mass-spec heatmaps, and on exposomics. */
export const Z_SCORED_MODES: HeatmapScaleMode[] = ["zscore", "rawZscore"];
export const EXPOSOMICS_MODES: HeatmapScaleMode[] = ["zscore", "log"];

type Colors = [string, string, ...string[]];

/**
 * Teal through neutral gray to orange, the theme's hues, with matching lightness steps on each arm
 * (OKLCH L 0.95 → 0.735 → 0.51) so +2 and −2 read as equally far from the middle.
 */
const DIVERGING_COLORS: Colors = ["#00766c", "#70b9af", "#eeeeee", "#e0946f", "#a34604"];

/**
 * The sequential ramp the explorer colors by too, so a value reads the same on both pages. Its stops
 * are within 1% of even.
 */
const RAMP_COLORS = SEQUENTIAL_RAMP.map(({ color }) => color) as unknown as Colors;

/** Where the z-score scales start: 99% of logged metabolomics cells fall inside, and 98.7% raw. */
const Z_LIMIT = 3;

const clamp = (value: number, [low, high]: [number, number]) => Math.min(Math.max(value, low), high);

/** Each row's values across the given samples, in their order - the shape buildHeatmapColorScale takes. */
export const valuesByRow = (rowKeys: string[], valueBySample: ReadonlyMap<string, number | null>[]) =>
  new Map(rowKeys.map((key) => [key, valueBySample.map((valueByRow) => valueByRow.get(key) ?? null)]));

/**
 * What the heatmap's adjustable colorbar needs of a scale. Cells are drawn unclamped and colorDomain
 * holds the colors at the ends, so moving the range recolors without rebuilding the grid.
 */
export type HeatmapColorbar = {
  /** Which mode this is, so a range set in one is dropped on switching to another. */
  mode: HeatmapScaleMode;
  kind: RampKind;
  /** A cell's unclamped value on the scale: what is colored, and what a sweep matches. */
  value: (rowKey: string, value: number) => number;
  presets: RangePreset[];
  /** Writes a value on the scale the way the legend labels it. */
  format: (value: number) => string;
  /** A cell's own value, where it wants more precision than the legend's ends; `format` otherwise. */
  formatValue?: (value: number) => string;
  /** What the colors follow, where the default range comes from, any caveat: the range panel's notes. */
  notes: string[];
};

export type HeatmapColorScale = {
  colors: Colors;
  colorDomain: [number, number];
  /** What a cell is colored by, held inside colorDomain - for a heatmap drawn without a colorbar. */
  toCount: (rowKey: string, value: number) => number;
  /** A cell's unclamped value for its tooltip, and, given the current range, which end color it takes. */
  describe: (rowKey: string, value: number, domain?: ColorRange) => string;
  /** Undefined only where no cell has a value for the scale to span. */
  colorbar?: HeatmapColorbar;
};

const formatZ = (z: number) => `${z < 0 ? "−" : ""}${Math.abs(z).toFixed(1)}`;

/** Where a value beyond the colors' range is colored, for a tooltip. Empty inside the range. */
const coloredAs = (value: number, [low, high]: ColorRange, format: (end: number) => string) =>
  value > high ? ` (colored as ${format(high)})` : value < low ? ` (colored as ${format(low)})` : "";

/**
 * @param reference each row's values across every sample, which every mode scales against so
 *   filtering the table can't repaint the remaining columns.
 * @param rowNoun what a row is, for the range panel's notes: "compound", "molecule".
 */
export const buildHeatmapColorScale = (
  mode: HeatmapScaleMode,
  reference: ReadonlyMap<string, (number | null)[]>,
  rowNoun: string
): HeatmapColorScale => {
  // Whether rows have undetected samples, whose statistics then come from detections alone (exposomics).
  const hasMissing = [...reference.values()].some((values) => values.includes(null));

  /** Each row z-scored across every sample, after `transform`, which `of` names. */
  const zScored = (transform: (value: number) => number, of: string): HeatmapColorScale => {
    const zByRow = new Map(
      [...reference].map(([key, values]) => [key, zScoreByRow(values.map((v) => (v === null ? null : transform(v))))])
    );
    const z = (key: string, value: number) => zByRow.get(key)!(transform(value));
    // Every cell's z, not only the shown ones', so a table filter can't move where "All" reaches.
    const reach = reachOf(
      Float64Array.from(
        [...reference].flatMap(([key, values]) => values.flatMap((v) => (v === null ? [] : [z(key, v)])))
      ).sort()
    );
    const signedZ = (end: number) => `${end > 0 ? "+" : ""}${formatZ(end)}`;
    return {
      colors: DIVERGING_COLORS,
      colorDomain: [-Z_LIMIT, Z_LIMIT],
      toCount: (key, value) => clamp(z(key, value), [-Z_LIMIT, Z_LIMIT]),
      describe: (key, value, domain = [-Z_LIMIT, Z_LIMIT]) => {
        const zScore = z(key, value);
        return `z = ${zScore.toFixed(2)}${coloredAs(zScore, domain, signedZ)}`;
      },
      colorbar: {
        mode,
        kind: "diverging",
        value: z,
        presets: symmetricPresets(Math.max(reach, Z_LIMIT)),
        format: formatZ,
        notes: [
          `Colors follow each ${rowNoun}'s z-score of ${of}, across every sample.`,
          ...(hasMissing
            ? [
                `Each ${rowNoun}'s z-scores come only from the samples it was detected in, so a ${rowNoun} found in a handful of samples has few values to vary against.`,
              ]
            : []),
        ],
      },
    };
  };

  switch (mode) {
    case "zscore":
      return zScored(toLogValue, "log10(value + 1)");

    case "rawZscore":
      return zScored((value) => value, "its values");

    case "log": {
      const sorted = Float64Array.from(
        [...reference.values()].flatMap((values) => values.filter((v): v is number => v !== null).map(toLogValue))
      ).sort();
      const domain: [number, number] = sorted.length ? defaultRange(sorted) : [0, 1];
      // Shown in the data's units, as the explorer's feature colorbar does.
      const format = (log: number) => formatValueBound(fromLogValue(log));
      return {
        colors: RAMP_COLORS,
        colorDomain: domain,
        toCount: (_, value) => clamp(toLogValue(value), domain),
        describe: (_, value, range = domain) =>
          `log10(value + 1) = ${toLogValue(value).toFixed(2)}${coloredAs(toLogValue(value), range, format)}`,
        colorbar: sorted.length
          ? {
              mode,
              kind: "sequential",
              value: (_, value) => toLogValue(value),
              presets: percentilePresets(sorted),
              format,
              formatValue: (log) => formatValue(fromLogValue(log)),
              notes: [
                "On a log scale: colors follow log10(value + 1).",
                `Starts at the middle ${100 - 2 * CLIP_PERCENTILE}% of cells, so a few extreme values don't wash out the rest.`,
              ],
            }
          : undefined,
      };
    }
  }
};
