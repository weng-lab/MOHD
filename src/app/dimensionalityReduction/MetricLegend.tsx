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
  /** The stretch of the ramp under the cursor, drawn on the bar as a window. */
  range?: RampRange | null;
  /**
   * Fired as the cursor moves along the bar and when it leaves, so the plot can highlight the
   * samples whose colors fall inside the window - the colorbar's counterpart to hovering a chip.
   */
  onRangeHover?: (range: RampRange | null) => void;
};

/** A stretch of the ramp, from 0 at its low end to 1 at its high end. */
export type RampRange = { from: number; to: number };

/**
 * How much of the ramp a hover on the bar takes in. Wide enough that the window holds a visible
 * handful of samples most places along it, narrow enough that sweeping from one end to the other
 * passes through colors that are plainly different.
 */
const RANGE_WIDTH = 0.15;

/**
 * The window centred on a point along the bar, slid inward at either end rather than cut short, so
 * it spans the same share of the ramp wherever the cursor is. Clipped samples sit at the ends, so a
 * window at either end takes them in, as it takes in their color.
 */
const rangeAt = (t: number): RampRange => {
  const from = Math.min(Math.max(t - RANGE_WIDTH / 2, 0), 1 - RANGE_WIDTH);
  return { from, to: from + RANGE_WIDTH };
};

const CLIP_NOTE = `Scale spans the middle ${100 - 2 * CLIP_PERCENTILE}% of samples, so a few extreme values don't wash out the rest`;

/**
 * Colorbar for a continuous value, standing where the chips stand for a field. Held to a chip row's
 * height, so switching between the two doesn't shift the plot. The value's name is left to the
 * plot's subtitle, which already says what the color is.
 */
const MetricLegend = ({
  metric: { label, format },
  scale,
  missing,
  hovered,
  note = CLIP_NOTE,
  range,
  onRangeHover,
}: MetricLegendProps) => (
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
        // Out of the way while the bar is swept, when it would sit over the plot and the samples
        // lighting up there; the note is about the ends, and shows on them and on focus. Not
        // interactive either, so a popper opened from an end label can't catch the cursor as it
        // moves onto the bar's hit area and end the sweep under it.
        <Tooltip arrow title={range ? "" : note} disableInteractive>
          <Stack direction="row" alignItems="center" gap={1} tabIndex={0}>
            <Typography variant="caption">
              {scale.clippedLow && "≤ "}
              {format(scale.low)}
            </Typography>
            {/*
              The hit area runs a few pixels above and below the bar, which is only 10px tall: a
              sweep from end to end drifts, and leaving the bar mid-sweep would drop the highlight.
              The negative margin keeps the chip row's height where it was.
            */}
            <Box
              onMouseMove={(event) => {
                const { left, width } = event.currentTarget.getBoundingClientRect();
                onRangeHover?.(rangeAt((event.clientX - left) / width));
              }}
              onMouseLeave={() => onRangeHover?.(null)}
              sx={{ py: 1, my: -1 }}
            >
              <Box
                role="img"
                aria-label={`${label} color scale, from blue at ${format(scale.low)} to red at ${format(scale.high)}`}
                sx={{ position: "relative", width: 160, height: 10, borderRadius: 5, background: METRIC_GRADIENT }}
              >
                {range && (
                  <Box
                    aria-hidden
                    data-testid="metric-range-window"
                    sx={{
                      position: "absolute",
                      top: -3,
                      bottom: -3,
                      left: `${range.from * 100}%`,
                      width: `${(range.to - range.from) * 100}%`,
                      borderRadius: "3px",
                      border: 2,
                      borderColor: "text.primary",
                      // White inside and out, so the frame holds against the dark blue end and the
                      // pale yellow alike - as the hover marker's ring does.
                      boxShadow: "0 0 0 1px #fff, inset 0 0 0 1px #fff",
                    }}
                  />
                )}
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
