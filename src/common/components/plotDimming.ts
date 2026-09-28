/**
 * Fading a plot's filtered-out points instead of dropping them, and the neutral colors that stay
 * distinct from a faded point. In an embedding, a sample's place only means something beside the
 * samples it was reduced with, so filtered samples stay, pale and underneath.
 */

import type { Point } from "@weng-lab/visualization";

/** Pale enough to read as background, and translucent so dense patches still show their shape. */
const DIMMED_COLOR = "#BDBDBD";
const DIMMED_OPACITY = 0.4;

/**
 * Two greys for groups that aren't categories - a missing value, QC material, a privacy bin - dark
 * enough never to read as faded (~26 ΔE2000 from dimmed points, ~29 from each other). Each page
 * assigns them to keep its own legend distinct: the explorer uses MID for missing and DARK for QC;
 * the WGS page, whose privacy slate sits near MID, uses DARK for "Unknown".
 */
export const NEUTRAL_MID = "#757575";
export const NEUTRAL_DARK = "#212121";

export type DimmedPoints<T> = {
  /** Every point, dimmed ones first so they're drawn beneath: what ScatterPlot takes. */
  points: Point<T>[];
  /** The points that passed, in their original order. */
  shown: Point<T>[];
};

const dim = <T>(point: Point<T>): Point<T> => ({ ...point, color: DIMMED_COLOR, opacity: DIMMED_OPACITY });

/**
 * Splits points by a filter, repainting the ones that fail rather than dropping them. Dimmed points
 * come first so they're drawn beneath - which also means they win ScatterPlot's hit test near a
 * shown point, so a tooltip should say when its sample is hidden.
 */
export const dimHidden = <T>(points: Point<T>[], isShown: (point: Point<T>) => boolean): DimmedPoints<T> => {
  const shown: Point<T>[] = [];
  const dimmed: Point<T>[] = [];

  for (const point of points) {
    if (isShown(point)) shown.push(point);
    else dimmed.push(dim(point));
  }

  return { points: [...dimmed, ...shown], shown };
};

/**
 * The points while a legend entry is hovered: the entry's own points as they are, and every other
 * point dimmed like a filtered one, so a handful of highlighted samples stand out from the rest.
 * `highlighted` is null while nothing is hovered, and a subset of `points` (the same objects)
 * otherwise; an empty one dims everything, as a colorbar window with no samples in it should.
 *
 * Safe to rebuild per hover: a legend sets its hover in an event handler, so the new points reach
 * ScatterPlot in the same render as its hoveredPoints and don't restart their growth - see
 * ExplorerPlot. The order is kept, so the highlighted points' place in the hit test doesn't move.
 */
export const spotlight = <T>(points: Point<T>[], highlighted: readonly Point<T>[] | null): Point<T>[] => {
  if (highlighted === null) return points;
  const kept = new Set(highlighted);
  return points.map((point) => (kept.has(point) ? point : dim(point)));
};
