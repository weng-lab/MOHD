/**
 * Fading a plot's filtered-out points instead of dropping them, and the neutral colors that have to
 * stay legible once pale grey means "filtered out".
 *
 * A PCA or UMAP places a sample against every other sample the reduction was run on, so a filter
 * that removes points takes away the very thing the plot is for: what is left has nothing to sit
 * against, and a tight cluster reads the same as a handful of survivors scattered over the same
 * space. The points a filter excludes therefore stay where they are, drawn pale and beneath the
 * rest.
 *
 * Kept beside PlotLegend rather than inside one page: the chip legend is what hides a group, and
 * every plot that moves to it should fade its points the same way and against the same neutrals.
 */

import type { Point } from "@weng-lab/visualization";

/**
 * The faded layer. Pale enough to read as background at a glance, and partly transparent so that a
 * dense patch of excluded samples still comes out darker than a sparse one - the shape of what was
 * filtered out is most of why it is still drawn.
 */
export const DIMMED_COLOR = "#BDBDBD";
export const DIMMED_OPACITY = 0.4;

/**
 * Two steps of grey for the groups that are not categories - a missing value, QC and reference
 * material, a privacy bin. Greyscale, because beside the saturated palettes that color the real
 * categories an unsaturated point is unmistakably not one of them.
 *
 * Two, because light grey is now what a filtered-out point looks like, and a group the reader can
 * still select must never read as one that has been faded away. That rules the pale end out and
 * leaves these: ~26 ΔE2000 from a stack of dimmed points, and ~29 from each other.
 *
 * A page picks the step that keeps its own legend apart, rather than each meaning one fixed thing.
 * The explorer has the whole scale to itself, so a missing value takes MID and a QC sample DARK.
 * The WGS page cannot: its privacy bin is a documented slate that already sits where MID does
 * (7 ΔE2000 apart), so "Unknown" takes DARK there and the reference plot's "Remaining" takes MID.
 */
export const NEUTRAL_MID = "#757575";
export const NEUTRAL_DARK = "#212121";

export type DimmedPoints<T> = {
  /** Every point, the dimmed ones first so they are drawn beneath the rest. This is what ScatterPlot takes. */
  points: Point<T>[];
  /** The points that passed, in the order they came in - what a count, a highlight or an empty state keys on. */
  shown: Point<T>[];
};

/**
 * Splits points by a filter, repainting the ones that fail it rather than dropping them.
 *
 * The dimmed points go first because the array is the draw order, and they belong underneath. The
 * one cost is that ScatterPlot hit-tests in that same order: where a dimmed point lands within a
 * few pixels of a shown one, the cursor reports the dimmed point. A tooltip should say when the
 * sample it names is filtered out rather than leave the reader to wonder why a colored point
 * answered for one they had hidden. Ordering the other way trades that for something worse - a
 * dense cloud of dimmed points drawn on top buries the samples the filter was meant to isolate.
 */
export const dimHidden = <T>(points: Point<T>[], isShown: (point: Point<T>) => boolean): DimmedPoints<T> => {
  const shown: Point<T>[] = [];
  const dimmed: Point<T>[] = [];

  for (const point of points) {
    if (isShown(point)) shown.push(point);
    else dimmed.push({ ...point, color: DIMMED_COLOR, opacity: DIMMED_OPACITY });
  }

  return { points: [...dimmed, ...shown], shown };
};
