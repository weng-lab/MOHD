"use client";

import { CircularProgress, Stack, Typography } from "@mui/material";
import type { RampRange } from "@/common/components/Colorbar/colorbarAxis";
import { FEATURE_KINDS, featureDefinition, featureTransform, type FeatureKind, type FeatureValues } from "./features";
import MetricLegend, { type ColorRangeControl } from "./MetricLegend";
import type { MetricScale } from "./metrics";

export type FeatureLegendProps = {
  kind: FeatureKind;
  feature: FeatureValues;
  /** Across log10(value + 1), which is what the colorbar's ends are written back out of. */
  scale: MetricScale | null;
  /** In log10, as the scale is - see MetricLegend. */
  values: ArrayLike<number>;
  /** Samples in focus the feature has no value for. */
  missing: number;
  /** The hovered sample's value, in log10 as the scale is. */
  hovered: number | null;
  /** The colorbar's own hover and range control, passed through - see MetricLegend. */
  sweep: RampRange | null;
  onSweep: (sweep: RampRange | null) => void;
  control?: ColorRangeControl;
};

/**
 * The colorbar for a feature, plus the states a fetched coloring has that a metric does not: none
 * picked, in flight, failed, or a feature the data does not carry.
 *
 * They read as a line of text where the bar would be, rather than as an empty plot with nothing to
 * say about it - an all-grey plot is what each of these four looks like, and they mean very
 * different things.
 */
const FeatureLegend = ({
  kind,
  feature,
  scale,
  values,
  missing,
  hovered,
  sweep,
  onSweep,
  control,
}: FeatureLegendProps) => {
  if (feature.status === "ready") {
    return (
      <MetricLegend
        metric={featureDefinition(kind, feature)}
        transform={featureTransform(kind)}
        scale={scale}
        values={values}
        missing={missing}
        hovered={hovered}
        sweep={sweep}
        onSweep={onSweep}
        control={control}
      />
    );
  }

  const { noun, measure, prompt } = FEATURE_KINDS[kind];
  const message = {
    idle: prompt,
    loading: `Loading ${measure}…`,
    // Named by id, not by name: the fetch that would have given us a name is the one that failed.
    missing: `No ${measure} recorded for ${feature.id}.`,
    error: `Could not load ${measure} for this ${noun}.`,
  }[feature.status];

  return (
    <Stack direction="row" alignItems="center" gap={1} minHeight={24} flexShrink={0}>
      {feature.status === "loading" && <CircularProgress size={12} aria-hidden />}
      <Typography variant="caption" color={feature.status === "error" ? "error" : "text.secondary"}>
        {message}
      </Typography>
    </Stack>
  );
};

export default FeatureLegend;
