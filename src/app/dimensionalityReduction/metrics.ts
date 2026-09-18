/**
 * ATAC-seq library quality metrics.
 *
 * Unlike the fields in fields.ts these are continuous, so a metric colors the plot along a ramp
 * rather than by group, and has no chips to toggle or values to filter by.
 */

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

/** The ramp as a CSS gradient, for the legend's colorbar. */
export const METRIC_GRADIENT = `linear-gradient(to right, ${METRIC_RAMP.map(({ at, color }) => `${color} ${Math.round(at * 100)}%`).join(", ")})`;

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

/** Linear interpolation between closest ranks - numpy's default, so it agrees with a quick check in Python. */
const percentile = (sorted: readonly number[], p: number) => {
  const rank = ((sorted.length - 1) * p) / 100;
  const below = Math.floor(rank);
  const above = Math.min(below + 1, sorted.length - 1);
  return sorted[below] + (sorted[above] - sorted[below]) * (rank - below);
};

/**
 * The scale for a metric's values. Pass every sample the ome has, never only the visible ones, so
 * that a filter can't repaint the points it leaves. Null when no sample has a value.
 */
export const metricScale = (values: readonly number[]): MetricScale | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const low = percentile(sorted, CLIP_PERCENTILE);
  const high = percentile(sorted, 100 - CLIP_PERCENTILE);
  return { low, high, clippedLow: sorted[0] < low, clippedHigh: sorted[sorted.length - 1] > high };
};

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

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
  const t = metricPosition(scale, value);
  // The stops are unevenly placed, so find the pair t falls between rather than indexing by step.
  const upper = Math.max(
    METRIC_RAMP.findIndex(({ at }) => at >= t),
    1
  );
  const [from, to] = [METRIC_RAMP[upper - 1], METRIC_RAMP[upper]];
  const mix = (t - from.at) / (to.at - from.at);
  const [start, end] = [toRgb(from.color), toRgb(to.color)];
  return `rgb(${start.map((channel, i) => Math.round(channel + (end[i] - channel) * mix)).join(",")})`;
};
