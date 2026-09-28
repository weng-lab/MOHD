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
  CLIP_PERCENTILE,
  SEQUENTIAL_RAMP,
} from "@/common/components/Colorbar/colorbarAxis";
import { NEUTRAL_MID } from "@/common/components/plotDimming";
import { metricColor, type ContinuousDefinition, type MetricScale } from "../model/metrics";

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
  /** The hovered point's value, marked on the bar. Null when there's none. */
  hovered: number | null;
  /** Any transform the values go through before they're colored, e.g. "log10(TPM + 1)". */
  transform?: string;
  /** The stretch of the ramp under the cursor, drawn on the bar as a window. */
  sweep: RampRange | null;
  /** Fired as the cursor moves along the bar and leaves it, so the plot can highlight the samples inside. */
  onSweep: (sweep: RampRange | null) => void;
  /** Where the colors stop can be moved, from a button beside the bar. Omitted, it can't. */
  control?: ColorRangeControl;
};

/** The bar's length: a chip row's worth of room, lying down. */
const BAR_LENGTH = 160;

/**
 * Colorbar for a continuous value, in place of a field's chips and held to their height so switching
 * doesn't shift the plot. The plot's subtitle names the value.
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
  // While the range editor is open, the end labels hold their width - see SteadyText.
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
        // Every sample has the same value, so there's no range for a bar to show.
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
              Hidden during a sweep, whose own count follows the cursor, and not interactive, so it
              can't catch the cursor moving onto the bar and end the sweep.
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
                    stops={SEQUENTIAL_RAMP}
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
                stops={SEQUENTIAL_RAMP}
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
