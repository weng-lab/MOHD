"use client";

import { useTheme } from "@mui/material/styles";
import { CLIP_PERCENTILE, SEQUENTIAL_RAMP } from "@/common/colorRamp";
import { captionLabelStyle } from "@/common/components/captionLabelStyle";
import { NEUTRAL_MID } from "@/common/neutralColors";
import { ColorbarLegend, type ColorRange, type ColorRangeControl, type RampRange } from "@weng-lab/visualization";
import type { ContinuousDefinition } from "../model/metrics";

export type MetricLegendProps = {
  /** A library metric, or anything else continuous the plot is colored by. */
  metric: ContinuousDefinition;
  /** Where the colors stop, fitted to every sample. Null while no sample has a value. */
  range: ColorRange | null;
  /**
   * Every sample in focus with a value, sorted ascending, in the range's units: what the histogram
   * counts, and whether an end label reads "≤" or "≥".
   */
  values: ArrayLike<number>;
  /** Samples in focus with no value for it, which take the missing neutral. */
  missing: number;
  /** The hovered point's value, marked on the bar. Null when there's none. */
  hovered: number | null;
  /**
   * A log transform the values go through before they're colored, e.g. "log10(TPM + 1)", named in
   * the range panel only: the legend's ends are the values themselves, which aren't transformed.
   */
  transform?: string;
  /** The stretch of the ramp under the cursor, drawn on the bar as a window. */
  sweep: RampRange | null;
  /** Fired as the cursor moves along the bar and leaves it, so the plot can highlight the samples inside. */
  onSweep: (sweep: RampRange | null) => void;
  /** Where the colors stop can be moved, from a button beside the bar. Omitted, it can't. */
  control?: ColorRangeControl;
};

/**
 * The explorer's colorbar: the shared ramp, labeled in the theme's caption, with the range panel's
 * notes on how its colors are scaled. The plot's subtitle names the value.
 */
const MetricLegend = ({
  metric: { label, format, formatValue },
  range,
  values,
  missing,
  hovered,
  transform,
  sweep,
  onSweep,
  control,
}: MetricLegendProps) => {
  const theme = useTheme();
  return (
    <ColorbarLegend
      label={label}
      stops={SEQUENTIAL_RAMP}
      range={range}
      values={values}
      format={format}
      formatValue={formatValue}
      noun="sample"
      sweep={sweep}
      onSweep={onSweep}
      marker={hovered}
      control={control}
      notes={[
        ...(transform ? [`On a log scale: colors follow ${transform}.`] : []),
        `Starts at the middle ${100 - 2 * CLIP_PERCENTILE}% of samples, so a few extreme values don't wash out the rest.`,
      ]}
      missing={{ count: missing, color: NEUTRAL_MID }}
      labelStyle={captionLabelStyle(theme)}
    />
  );
};

export default MetricLegend;
