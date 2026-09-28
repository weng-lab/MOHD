/** ATAC-seq library quality metrics: continuous, so they color along a ramp rather than by group. */

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

/** What a colorbar needs of whatever it stands for. A metric is one; a feature builds one (features.ts). */
export type ContinuousDefinition = {
  label: string;
  format: (value: number) => string;
  /** A sample's own value, where it wants more precision than the scale's rounded ends; `format` otherwise. */
  formatValue?: (value: number) => string;
};

export const isMetric = (value: string | null): value is Metric => METRICS.some(({ key }) => key === value);

export const metricDefinition = (metric: Metric): MetricDefinition => METRICS.find(({ key }) => key === metric)!;

/**
 * The original embedding explorer applet's scale, stops as it has them, so a sample reads the same
 * color in both. Its order is carried by hue, not lightness: the yellow stop is the lightest.
 */
export const METRIC_RAMP = [
  { at: 0, color: "#2541b2" },
  { at: 0.34, color: "#35a6a0" },
  { at: 0.68, color: "#f6d55c" },
  { at: 1, color: "#d8422c" },
] as const;

/**
 * Percentile trimmed off each end before the ramp is stretched across a metric: reads mapped reaches
 * 113M against a 99th percentile of 62M. Samples beyond an end take its color.
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

/** Where a value sits along the ramp, from 0 at `low` to 1 at `high`, held at the ends. */
export const metricPosition = (scale: MetricScale, value: number) => {
  const span = scale.high - scale.low;
  return span > 0 ? Math.min(Math.max((value - scale.low) / span, 0), 1) : 0.5;
};

/** A value's color on the ramp, or the missing neutral for no value. */
export const metricColor = (scale: MetricScale | null, value: number | null): string => {
  if (scale === null || value === null) return NEUTRAL_MID;
  return colorAt(METRIC_RAMP, metricPosition(scale, value));
};
