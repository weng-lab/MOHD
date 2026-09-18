"use client";

import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { NEUTRAL_MID } from "@/common/components/plotDimming";
import {
  CLIP_PERCENTILE,
  METRIC_GRADIENT,
  metricColor,
  metricPosition,
  type ContinuousDefinition,
  type MetricScale,
} from "./metrics";

export type MetricLegendProps = {
  /** A library metric, or anything else continuous the plot is colored by. */
  metric: ContinuousDefinition;
  scale: MetricScale | null;
  /** Samples in focus with no value for it, which take the missing neutral. */
  missing: number;
  /**
   * The hovered point's value, marked on the bar - the colorbar's counterpart to the ring a chip
   * gets for its group. Null when no point is hovered, or the hovered one has no value.
   */
  hovered: number | null;
  /** What the scale is and where its ends come from. Defaults to the clipping the metrics use. */
  note?: string;
};

const CLIP_NOTE = `Scale spans the middle ${100 - 2 * CLIP_PERCENTILE}% of samples, so a few extreme values don't wash out the rest`;

/**
 * Colorbar for a continuous value, standing where the chips stand for a field. Held to a chip row's
 * height, so switching between the two doesn't shift the plot. The value's name is left to the
 * plot's subtitle, which already says what the color is.
 */
const MetricLegend = ({ metric: { label, format }, scale, missing, hovered, note = CLIP_NOTE }: MetricLegendProps) => (
  <Stack direction="row" alignItems="center" flexWrap="wrap" columnGap={2} rowGap={0.5} minHeight={24} flexShrink={0}>
    {scale &&
      // A bar would promise a range to read a point's color against, and there is none: every
      // sample carries the same value, so every point is the one color. Said outright instead -
      // "not detected in any sample" is worth knowing, and reachable by searching a gene.
      (scale.low === scale.high ? (
        <Stack direction="row" alignItems="center" gap={0.75}>
          <Box
            sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: metricColor(scale, scale.low), flexShrink: 0 }}
          />
          <Typography variant="caption">{format(scale.low)} in every sample</Typography>
        </Stack>
      ) : (
        <Tooltip arrow title={note}>
          <Stack direction="row" alignItems="center" gap={1} tabIndex={0}>
            <Typography variant="caption">
              {scale.clippedLow && "≤ "}
              {format(scale.low)}
            </Typography>
            <Box
              role="img"
              aria-label={`${label} color scale, from blue at ${format(scale.low)} to red at ${format(scale.high)}`}
              sx={{ position: "relative", width: 160, height: 10, borderRadius: 5, background: METRIC_GRADIENT }}
            >
              {hovered !== null && (
                <Box
                  aria-hidden
                  data-testid="metric-hover-marker"
                  sx={{
                    position: "absolute",
                    // Overhangs the bar, so it reads as a mark on the scale rather than a stripe in it.
                    top: -4,
                    bottom: -4,
                    left: `${metricPosition(scale, hovered) * 100}%`,
                    width: 3,
                    transform: "translateX(-50%)",
                    borderRadius: "2px",
                    bgcolor: "text.primary",
                    // A white ring, so the line holds against the dark blue end and the pale yellow alike.
                    boxShadow: "0 0 0 1px #fff",
                  }}
                />
              )}
            </Box>
            <Typography variant="caption">
              {scale.clippedHigh && "≥ "}
              {format(scale.high)}
            </Typography>
          </Stack>
        </Tooltip>
      ))}
    {missing > 0 && (
      <Stack direction="row" alignItems="center" gap={0.75}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: NEUTRAL_MID, flexShrink: 0 }} />
        <Typography variant="caption">No value</Typography>
        <Typography variant="caption" color="text.secondary">
          {missing}
        </Typography>
      </Stack>
    )}
  </Stack>
);

export default MetricLegend;
