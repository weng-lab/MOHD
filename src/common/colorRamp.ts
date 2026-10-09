/** MOHD's sequential ramp and where it starts, shared by the explorer's colorbar and the exposomics heatmap. */

import { percentileRange, type ColorRange } from "@weng-lab/visualization";

/**
 * The sequential scale: the original embedding explorer applet's, stops as it has them, so a sample
 * reads the same color in both. Its order is carried by hue, not lightness: the yellow stop is the
 * lightest.
 */
export const SEQUENTIAL_RAMP = [
  { at: 0, color: "#2541b2" },
  { at: 0.34, color: "#35a6a0" },
  { at: 0.68, color: "#f6d55c" },
  { at: 1, color: "#d8422c" },
] as const;

/**
 * Percentile trimmed off each end before a sequential ramp is stretched across values: ATAC's reads
 * mapped reaches 113M against a 99th percentile of 62M. Values beyond an end take its color.
 */
export const CLIP_PERCENTILE = 2;

/** Where a sequential ramp's colors stop until the reader moves them: the middle 96% of the values. */
export const defaultRange = (sorted: ArrayLike<number>): ColorRange => percentileRange(sorted, CLIP_PERCENTILE);
