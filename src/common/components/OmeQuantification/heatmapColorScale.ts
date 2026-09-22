import { CLIP_PERCENTILE, METRIC_RAMP, metricScale } from "@/app/dimensionalityReduction/metrics";
import { zScoreByRow } from "./zScoreByRow";

/**
 * Ways to color an ome's quantification heatmap, kept side by side while one is chosen.
 *
 * - "original": what the heatmaps shipped with. Each row z-scored on its raw values across the shown
 *   samples, the scale stretched to the largest |z| anywhere. The raw values are right-skewed, so a
 *   single outlier sample sets a domain near ±√(n − 1) - about ±33 on metabolomics - and nearly every
 *   other cell lands in the middle of it, where the old ramp has no neutral color.
 * - "zscore": each row z-scored on log10(value + 1) across every sample, held at ±3, on a diverging
 *   scale with a neutral midpoint.
 * - "log": log10(value + 1) itself, on one scale for the whole heatmap, clipped to the middle 96% of
 *   cells - the explorer's feature coloring, applied to every row at once.
 * - "raw": what exposomics shipped with instead of "original" - the raw value, from 0 to the largest shown.
 */
export type HeatmapScaleMode = "zscore" | "log" | "original" | "raw";

export const HEATMAP_SCALE_LABELS: Record<HeatmapScaleMode, string> = {
  zscore: "Z-score (log, ±3)",
  log: "Log value",
  original: "Original z-score",
  raw: "Original raw value",
};

/** The toggle's options on a page whose heatmap shipped z-scored, and on exposomics, which shipped raw. */
export const Z_SCORED_MODES: HeatmapScaleMode[] = ["zscore", "log", "original"];
export const RAW_MODES: HeatmapScaleMode[] = ["zscore", "log", "raw"];

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

/** Where the z-score scale stops. 99% of metabolomics cells fall inside it once the values are logged. */
const Z_LIMIT = 3;

/** The explorer's transform - see toLogValue in the explorer's features.ts. */
const toLog = (value: number) => Math.log10(value + 1);

const clamp = (value: number, [low, high]: [number, number]) => Math.min(Math.max(value, low), high);

const formatBound = (value: number) =>
  value.toLocaleString("en-US", { notation: "compact", maximumSignificantDigits: 2 });

/** Each row's values across the given samples, in their order - the shape buildHeatmapColorScale takes. */
export const valuesByRow = (rowKeys: string[], valueBySample: ReadonlyMap<string, number | null>[]) =>
  new Map(rowKeys.map((key) => [key, valueBySample.map((valueByRow) => valueByRow.get(key) ?? null)]));

export type HeatmapColorScale = {
  /** Undefined keeps the shell's default ramp. */
  colors?: Colors;
  colorDomain: [number, number];
  /** What a cell is colored by, held inside colorDomain: the library extrapolates past its ends rather than clamping. */
  toCount: (rowKey: string, value: number) => number;
  /** The value behind a cell's color, unclamped, for its tooltip. */
  describe: (rowKey: string, value: number) => string;
  /** What the legend's numbers are, since the library's legend carries no title. */
  caption: string;
};

/**
 * @param reference each row's values across every sample the ome has, which the new modes scale
 *   against so that filtering the table can't repaint the columns it leaves.
 * @param shown each row's values across the samples on screen, which the original mode scaled against.
 * @param rowNoun what a row is, for the caption: "compound", "metal".
 */
export const buildHeatmapColorScale = (
  mode: HeatmapScaleMode,
  reference: ReadonlyMap<string, (number | null)[]>,
  shown: ReadonlyMap<string, (number | null)[]>,
  rowNoun: string
): HeatmapColorScale => {
  const sampleCount = [...reference.values()][0]?.length ?? 0;
  // Exposomics detects most molecules in a minority of samples; a row's statistics come from those alone.
  const hasMissing = [...reference.values()].some((values) => values.includes(null));

  switch (mode) {
    case "original": {
      const zByRow = new Map([...shown].map(([key, values]) => [key, zScoreByRow(values)]));
      const maxAbs = [...shown].reduce(
        (max, [key, values]) =>
          values.reduce<number>(
            (rowMax, v) => (v === null ? rowMax : Math.max(rowMax, Math.abs(zByRow.get(key)!(v)))),
            max
          ),
        0
      );
      return {
        colorDomain: [-maxAbs, maxAbs],
        toCount: (key, value) => zByRow.get(key)!(value),
        describe: (key, value) => `z = ${zByRow.get(key)!(value).toFixed(2)}`,
        caption: `Each ${rowNoun}'s raw value as a z-score across the shown samples, stretched to the largest |z| (${maxAbs.toFixed(1)}).`,
      };
    }

    case "zscore": {
      const zByRow = new Map(
        [...reference].map(([key, values]) => [key, zScoreByRow(values.map((v) => (v === null ? null : toLog(v))))])
      );
      const z = (key: string, value: number) => zByRow.get(key)!(toLog(value));
      const shownCells = [...shown].flatMap(([key, values]) =>
        values.filter((v): v is number => v !== null).map((v) => z(key, v))
      );
      const beyond = shownCells.filter((v) => Math.abs(v) > Z_LIMIT).length;
      return {
        colors: DIVERGING_COLORS,
        colorDomain: [-Z_LIMIT, Z_LIMIT],
        toCount: (key, value) => clamp(z(key, value), [-Z_LIMIT, Z_LIMIT]),
        describe: (key, value) => {
          const zScore = z(key, value);
          return `z = ${zScore.toFixed(2)}${Math.abs(zScore) > Z_LIMIT ? ` (colored as ${zScore > 0 ? "+" : "−"}${Z_LIMIT})` : ""}`;
        },
        caption:
          `Each ${rowNoun}'s log10(value + 1) as a z-score across all ${sampleCount} samples` +
          `${hasMissing ? " (those with a value)" : ""}. ` +
          `Colors stop at ±${Z_LIMIT}; ${((beyond / Math.max(shownCells.length, 1)) * 100).toFixed(1)}% of shown cells lie beyond.`,
      };
    }

    case "log": {
      const scale = metricScale(
        [...reference.values()].flatMap((values) => values.filter((v): v is number => v !== null).map(toLog))
      );
      const domain: [number, number] = scale ? [scale.low, scale.high] : [0, 1];
      return {
        colors: RAMP_COLORS,
        colorDomain: domain,
        toCount: (_, value) => clamp(toLog(value), domain),
        describe: (_, value) => `log10(value + 1) = ${toLog(value).toFixed(2)}`,
        caption:
          `log10(value + 1), one scale for every ${rowNoun}. Spans the middle ${100 - 2 * CLIP_PERCENTILE}% of all cells ` +
          `(${formatBound(10 ** domain[0] - 1)} – ${formatBound(10 ** domain[1] - 1)}); cells beyond take the end color.`,
      };
    }

    case "raw": {
      const max = [...shown.values()].reduce<number>(
        (rowsMax, values) => values.reduce<number>((rowMax, v) => (v === null ? rowMax : Math.max(rowMax, v)), rowsMax),
        0
      );
      return {
        colorDomain: [0, max],
        toCount: (_, value) => value,
        describe: (_, value) => `${value}`,
        caption: `The raw value, from 0 to the largest shown (${formatBound(max)}).`,
      };
    }
  }
};
