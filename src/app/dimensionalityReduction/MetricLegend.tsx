"use client";

import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import ColorbarGraphic, { colorbarDepth } from "@/common/components/Colorbar/ColorbarGraphic";
import ColorRangeButton from "@/common/components/Colorbar/ColorRangeButton";
import SteadyText from "@/common/components/Colorbar/SteadyText";
import {
  sameRange,
  type ColorRange,
  type RampRange,
  type RangePreset,
} from "@/common/components/Colorbar/colorbarAxis";
import { NEUTRAL_MID } from "@/common/components/plotDimming";
import { CLIP_PERCENTILE, METRIC_RAMP, metricColor, type ContinuousDefinition, type MetricScale } from "./metrics";

/** What moving the colors' range needs beyond what the legend already has. */
export type ColorRangeControl = {
  defaultRange: ColorRange;
  /** The lowest and highest value any sample has. */
  extent: ColorRange;
  presets: RangePreset[];
  /** Fired on every step of a drag, and for a preset or a reset. */
  onChange: (range: ColorRange) => void;
  /** Fired as the editor closes, to save the range it was left at - see ColorRangeButton. */
  onClose?: () => void;
};

export type MetricLegendProps = {
  /** A library metric, or anything else continuous the plot is colored by. */
  metric: ContinuousDefinition;
  scale: MetricScale | null;
  /** Every sample in focus with a value, sorted ascending, in the scale's units: what the histogram counts. */
  values: ArrayLike<number>;
  /** Samples in focus with no value for it, which take the missing neutral. */
  missing: number;
  /**
   * The hovered point's value, marked on the bar - the colorbar's counterpart to the ring a chip
   * gets for its group. Null when no point is hovered, or the hovered one has no value.
   */
  hovered: number | null;
  /** What the values go through before they are colored, where they go through anything - "log10(TPM + 1)". */
  transform?: string;
  /** The stretch of the ramp under the cursor, drawn on the bar as a window. */
  sweep: RampRange | null;
  /**
   * Fired as the cursor moves along the bar and when it leaves, so the plot can highlight the
   * samples whose colors fall inside the window - the colorbar's counterpart to hovering a chip.
   */
  onSweep: (sweep: RampRange | null) => void;
  /** Where the colors stop can be moved, from a button beside the bar. Omitted, it can't. */
  control?: ColorRangeControl;
};

/** The bar's length: a chip row's worth of room, lying down. */
const BAR_LENGTH = 160;

/**
 * Colorbar for a continuous value, standing where the chips stand for a field. Held to a chip row's
 * height, so switching between the two doesn't shift the plot. The value's name is left to the
 * plot's subtitle, which already says what the color is.
 *
 * Over the bar, how many samples lie along it - see ColorbarGraphic.
 */
const MetricLegend = ({
  metric: { label, format, formatValue },
  scale,
  values,
  missing,
  hovered,
  transform,
  sweep,
  onSweep,
  control,
}: MetricLegendProps) => {
  const range: ColorRange | null = scale && [scale.low, scale.high];
  const adjusted = control !== undefined && range !== null && !sameRange(range, control.defaultRange);
  const extent = control?.extent ?? (values.length ? [values[0], values[values.length - 1]] : null);
  // Whether the range editor is open, while which the end labels hold their width - see SteadyText.
  const [editing, setEditing] = useState(false);

  // What the scale is and where its ends come from; shown on the end labels, and on the bar until a sweep starts.
  const note =
    scale &&
    [
      transform && `Colored by ${transform}`,
      adjusted
        ? `Colors span ${format(scale.low)} – ${format(scale.high)}, as set with the adjuster beside the bar`
        : `Colors span the middle ${100 - 2 * CLIP_PERCENTILE}% of samples, so a few extreme values don't wash out the rest`,
      extent && `Values run ${format(extent[0])} to ${format(extent[1])}`,
    ]
      .filter(Boolean)
      .join(". ") + ".";

  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" columnGap={2} rowGap={0.5} minHeight={24} flexShrink={0}>
      {scale &&
        range &&
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
          <Stack direction="row" alignItems="center" gap={0.5}>
            {/*
              The note gets out of the way while the bar is swept, when it would sit over the plot and
              the samples lighting up there; the sweep's own count follows the cursor instead. Not
              interactive either, so a popper opened from an end label can't catch the cursor as it
              moves onto the bar and end the sweep under it.
            */}
            <Tooltip arrow title={sweep ? "" : note} disableInteractive>
              <Stack direction="row" alignItems="center" gap={1} tabIndex={0}>
                <Typography variant="caption">
                  <SteadyText text={`${scale.clippedLow ? "≤ " : ""}${format(scale.low)}`} hold={editing} align="end" />
                </Typography>
                <svg
                  width={BAR_LENGTH}
                  height={colorbarDepth("horizontal")}
                  role="img"
                  aria-label={`${label} color scale, from blue at ${format(scale.low)} to red at ${format(scale.high)}`}
                  style={{ display: "block", overflow: "visible" }}
                >
                  <ColorbarGraphic
                    orientation="horizontal"
                    length={BAR_LENGTH}
                    stops={METRIC_RAMP}
                    range={range}
                    values={values}
                    format={format}
                    formatValue={formatValue}
                    noun="sample"
                    sweep={sweep}
                    onSweep={onSweep}
                    marker={hovered}
                  />
                </svg>
                <Typography variant="caption">
                  <SteadyText text={`${scale.clippedHigh ? "≥ " : ""}${format(scale.high)}`} hold={editing} />
                </Typography>
              </Stack>
            </Tooltip>
            {control && (
              <ColorRangeButton
                stops={METRIC_RAMP}
                kind="sequential"
                range={range}
                values={values}
                format={format}
                noun="sample"
                {...control}
                onOpen={() => setEditing(true)}
                onClose={() => {
                  setEditing(false);
                  control.onClose?.();
                }}
              />
            )}
          </Stack>
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
};

export default MetricLegend;
