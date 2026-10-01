/**
 * Shape as a second categorical encoding on a scatter plot. The circle is kept back for groups that
 * aren't categories - QC material, a missing value - so a circle always means "no category", and
 * values draw from the other six.
 */

import { POINT_SHAPES, type PointShape } from "@weng-lab/visualization";

const NEUTRAL_SHAPE: PointShape = "circle";

/** The shapes a field's values draw from, in assignment order. */
const VALUE_SHAPES: readonly PointShape[] = POINT_SHAPES.filter((shape) => shape !== NEUTRAL_SHAPE);

export type ShapeScale = ReadonlyMap<string, PointShape>;

/**
 * A shape for each value, in the order given, or null where there are more values than shapes:
 * repeating one would draw two values as the same. Give the values in a fixed order rather than by
 * count, so each keeps its shape as the data changes.
 */
export const shapeScaleOf = (values: readonly string[]): ShapeScale | null =>
  values.length > VALUE_SHAPES.length ? null : new Map(values.map((value, index) => [value, VALUE_SHAPES[index]]));

/** A group's shape: the neutral one for anything the scale doesn't name. */
export const shapeOf = (scale: ShapeScale | null, group: string | null): PointShape =>
  (group === null ? undefined : scale?.get(group)) ?? NEUTRAL_SHAPE;
