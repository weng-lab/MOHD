import { METRIC_RAMP, defaultRange } from "@/app/dimensionalityReduction/metrics";
import {
  percentilePresets,
  reachOf,
  symmetricPresets,
  type ColorRange,
  type RampKind,
  type RangePreset,
} from "@/common/components/Colorbar/colorbarAxis";
import { zScoreByRow } from "./zScoreByRow";

/**
 * Ways to color an ome's quantification heatmap.
 *
 * - "zscore": each row z-scored on log10(value + 1) across every sample.
 * - "rawZscore": each row z-scored on its raw values across every sample - the same scale in every
 *   other respect, so switching between the two shows what the log does and nothing else. Raw
 *   values are right-skewed, so these z-scores are too: they run to +33 on metabolomics but rarely
 *   below -3, and a row's high outliers stand out where the log spreads its low ones.
 *
 *   Both start at ±3 on a diverging scale with a neutral midpoint, and the reader can move it.
 * - "log": log10(value + 1) itself, on one scale for the whole heatmap, starting at the middle 96%
 *   of cells - the explorer's feature coloring, applied to every row at once. For exposomics, where
 *   most molecules are detected in a minority of samples: a z-score there rests on the few samples
 *   a molecule turned up in, and says nothing of whether it turned up at all, which one scale for
 *   every cell shows at a glance.
 */
export type HeatmapScaleMode = "zscore" | "rawZscore" | "log";

/** Named by formula, which says what a caption beside the toggle used to spell out. */
export const HEATMAP_SCALE_LABELS: Record<HeatmapScaleMode, string> = {
  zscore: "Z-score: log10(value + 1)",
  rawZscore: "Z-score: raw value",
  log: "log10(value + 1)",
};

/** The toggle's options on the mass-spec heatmaps, and on exposomics. */
export const Z_SCORED_MODES: HeatmapScaleMode[] = ["zscore", "rawZscore"];
export const EXPOSOMICS_MODES: HeatmapScaleMode[] = ["zscore", "log"];

type Colors = [string, string, ...string[]];

/**
 * Teal through a neutral gray to orange, the theme's two hues. Each arm steps down in lightness by
 * the same amounts (OKLCH L 0.95 → 0.735 → 0.51), so +2 and −2 read as equally far from the middle.
 * The teal pole is the theme's primary.light as it is; the theme's own oranges sit lighter than it,
 * so the orange arm is the same hue taken to the teal's lightness.
 */
const DIVERGING_COLORS: Colors = ["#00766c", "#70b9af", "#eeeeee", "#e0946f", "#a34604"];

/** The explorer's ramp, so a value reads the same color on both pages. Its stops are within 1% of even. */
const RAMP_COLORS = METRIC_RAMP.map(({ color }) => color) as unknown as Colors;

/**
 * Where the z-score scales start out stopping. 99% of metabolomics cells fall inside it once the
 * values are logged, and 98.7% of their raw values do.
 */
const Z_LIMIT = 3;

/** The explorer's transform - see toLogValue in the explorer's features.ts. */
const toLog = (value: number) => Math.log10(value + 1);

const clamp = (value: number, [low, high]: [number, number]) => Math.min(Math.max(value, low), high);

/** An end of the log scale: it falls between cells rather than on one, so a magnitude is enough. */
const formatBound = (value: number) =>
  value.toLocaleString("en-US", { notation: "compact", maximumSignificantDigits: 2 });

/** A cell's own value, with the precision two nearby cells need to be told apart. */
const formatValue = (value: number) =>
  value.toLocaleString("en-US", { notation: "compact", maximumSignificantDigits: 4 });

/** Each row's values across the given samples, in their order - the shape buildHeatmapColorScale takes. */
export const valuesByRow = (rowKeys: string[], valueBySample: ReadonlyMap<string, number | null>[]) =>
  new Map(rowKeys.map((key) => [key, valueBySample.map((valueByRow) => valueByRow.get(key) ?? null)]));

/**
 * What the heatmap's adjustable colorbar needs of a scale. The heatmap draws each cell's `value`
 * unclamped and lets colorDomain - the reader's range, starting at the scale's own - hold the colors
 * at the ends, so moving the range recolors the grid without rebuilding it.
 */
export type HeatmapColorbar = {
  /** Which mode this is, so a range set in one is dropped on switching to another. */
  mode: HeatmapScaleMode;
  kind: RampKind;
  /** A cell's place on the scale before any range holds it at an end - what is colored, and what a sweep matches. */
  value: (rowKey: string, value: number) => number;
  presets: RangePreset[];
  /** Writes a value on the scale the way the legend labels it. */
  format: (value: number) => string;
  /** A cell's own value, where it wants more precision than the legend's ends; `format` otherwise. */
  formatValue?: (value: number) => string;
  /** A caveat on reading the scale, added to the legend's tooltip. */
  note?: string;
};

export type HeatmapColorScale = {
  colors: Colors;
  colorDomain: [number, number];
  /** What a cell is colored by, held inside colorDomain - for a heatmap drawn without a colorbar. */
  toCount: (rowKey: string, value: number) => number;
  /**
   * The value behind a cell's color, unclamped, for its tooltip - and, given the range the colors
   * span now, which end color a value beyond it takes.
   */
  describe: (rowKey: string, value: number, domain?: ColorRange) => string;
  /** Undefined only where no cell has a value for the scale to span. */
  colorbar?: HeatmapColorbar;
};

const formatZ = (z: number) => `${z < 0 ? "−" : ""}${Math.abs(z).toFixed(1)}`;

/** Where a value beyond the colors' range is colored, for a tooltip. Empty inside the range. */
const coloredAs = (value: number, [low, high]: ColorRange, format: (end: number) => string) =>
  value > high ? ` (colored as ${format(high)})` : value < low ? ` (colored as ${format(low)})` : "";

/**
 * @param reference each row's values across every sample the ome has, which every mode scales
 *   against so that filtering the table can't repaint the columns it leaves.
 * @param rowNoun what a row is, for the legend's tooltip: "compound", "molecule".
 */
export const buildHeatmapColorScale = (
  mode: HeatmapScaleMode,
  reference: ReadonlyMap<string, (number | null)[]>,
  rowNoun: string
): HeatmapColorScale => {
  // Exposomics detects most molecules in a minority of samples; a row's statistics come from those alone.
  const hasMissing = [...reference.values()].some((values) => values.includes(null));

  /** Each row z-scored across every sample, after `transform` - so the z-score modes differ in the transform alone. */
  const zScored = (transform: (value: number) => number): HeatmapColorScale => {
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
        note: hasMissing
          ? `Each ${rowNoun}'s z-scores come only from the samples it was detected in, so a ${rowNoun} found in a handful of samples has few values to vary against.`
          : undefined,
      },
    };
  };

  switch (mode) {
    case "zscore":
      return zScored(toLog);

    case "rawZscore":
      return zScored((value) => value);

    case "log": {
      const sorted = Float64Array.from(
        [...reference.values()].flatMap((values) => values.filter((v): v is number => v !== null).map(toLog))
      ).sort();
      const domain: [number, number] = sorted.length ? defaultRange(sorted) : [0, 1];
      // Written back out of log10, in the data's own units, as the explorer's feature colorbar writes them.
      const format = (log: number) => formatBound(10 ** log - 1);
      return {
        colors: RAMP_COLORS,
        colorDomain: domain,
        toCount: (_, value) => clamp(toLog(value), domain),
        describe: (_, value, range = domain) =>
          `log10(value + 1) = ${toLog(value).toFixed(2)}${coloredAs(toLog(value), range, format)}`,
        colorbar: sorted.length
          ? {
              mode,
              kind: "sequential",
              value: (_, value) => toLog(value),
              presets: percentilePresets(sorted),
              format,
              formatValue: (log) => formatValue(10 ** log - 1),
            }
          : undefined,
      };
    }
  }
};
