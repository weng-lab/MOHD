"use client";

import { CircularProgress, Stack, Typography } from "@mui/material";
import type { ColorRangeControl, RampRange } from "@/common/legends";
import {
  FEATURE_KINDS,
  featureDefinition,
  featureTransform,
  type FeatureKind,
  type FeatureValues,
} from "../model/features";
import MetricLegend from "./MetricLegend";
import type { MetricScale } from "../model/metrics";

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
 * The colorbar for a feature, or a line of text for the states a metric doesn't have - none picked,
 * loading, failed, or not in the data - which would otherwise all look like the same gray plot.
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
    // By id: the name would have come from the fetch that failed.
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
