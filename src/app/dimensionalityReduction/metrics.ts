/**
 * ATAC-seq library quality metrics.
 *
 * Unlike the fields in fields.ts these are continuous, so a metric colors the plot along a ramp
 * rather than by group, and has no chips to toggle or values to filter by.
 */

import { colorAt, percentile, type ColorRange } from "@/common/components/Colorbar/colorbarAxis";
import { NEUTRAL_MID } from "@/common/components/plotDimming";

/** In the order the color select lists them. `key` is what a link carries (?color=frip). */
export const METRICS = [
  { key: "tss", label: "TSS enrichment", format: (value: number) => value.toFixed(1) },
  { key: "frip", label: "FRiP score", format: (value: number) => value.toFixed(3) },
  // Tens of millions, where single reads are noise.
  { key: "reads", label: "Reads mapped", format: (value: number) => `${(value / 1e6).toFixed(1)}M` },
] as const;

export type MetricDefinition = (typeof METRICS)[number];

export type Metric = MetricDefinition["key"];

/**
 * All a colorbar needs of whatever it stands for: a name, and how to write a value on its scale.
 *
 * A metric satisfies it as it is. A feature's quantification, which is continuous in the same way
 * without being a library metric, builds one - see features.ts.
 */
export type ContinuousDefinition = {
  label: string;
  format: (value: number) => string;
  /** A sample's own value, where it wants more precision than the scale's rounded ends; `format` otherwise. */
  formatValue?: (value: number) => string;
};

export const isMetric = (value: string | null): value is Metric => METRICS.some(({ key }) => key === value);

export const metricDefinition = (metric: Metric): MetricDefinition => METRICS.find(({ key }) => key === metric)!;

/**
 * Blue through teal and yellow to red: the continuous scale from the original embedding explorer
 * applet, stops and positions as it has them, so a sample reads the same color in both.
 *
 * Several hues rather than one, so the two ends of the scale are told apart by hue at a glance
 * rather than by shade. The yellow stop is the lightest color on it, though, so brightness peaks in
 * the upper middle instead of rising with the value - it is the hue that carries the order.
 */
export const METRIC_RAMP = [
  { at: 0, color: "#2541b2" },
  { at: 0.34, color: "#35a6a0" },
  { at: 0.68, color: "#f6d55c" },
  { at: 1, color: "#d8422c" },
] as const;

/**
 * Percentile trimmed off each end of a metric's range before the ramp is stretched across it.
 *
 * Reads mapped reaches 113M against a 99th percentile of 62M; stretched from minimum to maximum,
 * nearly every sample would land in the blue third of the ramp. Samples beyond either end take that
 * end's color, and the legend marks the ends with ≤ and ≥.
 */
export const CLIP_PERCENTILE = 2;

export type MetricScale = {
  /** The values the two ends of the ramp stand for. */
  low: number;
  high: number;
  /** Whether any sample lies beyond each end, and so shares its color. */
  clippedLow: boolean;
  clippedHigh: boolean;
};

/** Where a metric's colors stop until the reader moves them: the middle 96% of its values, sorted ascending. */
export const defaultRange = (sorted: ArrayLike<number>): ColorRange => [
  percentile(sorted, CLIP_PERCENTILE),
  percentile(sorted, 100 - CLIP_PERCENTILE),
];

/** The scale for colors spanning `range`, over a metric's values sorted ascending. */
export const scaleOver = (sorted: ArrayLike<number>, [low, high]: ColorRange): MetricScale => ({
  low,
  high,
  clippedLow: sorted[0] < low,
  clippedHigh: sorted[sorted.length - 1] > high,
});

/**
 * The default scale for a metric's values. Pass every sample the ome has, never only the visible
 * ones, so that a filter can't repaint the points it leaves. Null when no sample has a value.
 */
export const metricScale = (values: readonly number[]): MetricScale | null => {
  if (values.length === 0) return null;
  const sorted = Float64Array.from(values).sort();
  return scaleOver(sorted, defaultRange(sorted));
};

/**
 * Where a value sits along the ramp, from 0 at `low` to 1 at `high`. A value beyond either end is
 * held at that end - the same place its color comes from, so a point and its mark on the legend
 * always agree.
 */
export const metricPosition = (scale: MetricScale, value: number) => {
  const span = scale.high - scale.low;
  return span > 0 ? Math.min(Math.max((value - scale.low) / span, 0), 1) : 0.5;
};

/** A value's color on the ramp. Samples with no value take the missing neutral, as they do on any other coloring. */
export const metricColor = (scale: MetricScale | null, value: number | null): string => {
  if (scale === null || value === null) return NEUTRAL_MID;
  return colorAt(METRIC_RAMP, metricPosition(scale, value));
};
