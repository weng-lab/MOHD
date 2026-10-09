/** ATAC-seq library quality metrics: continuous, so they color along a ramp rather than by group. */

import { SEQUENTIAL_RAMP } from "@/common/colorRamp";
import { rampColor, type ColorRange } from "@weng-lab/visualization";
import { NEUTRAL_MID } from "@/common/neutralColors";

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

/** Colors a value on the ramp spanning `range`, held at its ends, or in the missing neutral for no value. */
export const metricColor = (range: ColorRange | null) => {
  const onRamp = range && rampColor(SEQUENTIAL_RAMP, range);
  return (value: number | null): string => (onRamp === null || value === null ? NEUTRAL_MID : onRamp(value));
};
