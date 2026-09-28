/** Shape as a second categorical encoding, for the few-valued, unordered fields FIELDS marks `shapeable`. */

import { POINT_SHAPES, type PointShape } from "@weng-lab/visualization";
import { FIELDS, fieldsFor, isNeutralGroup, type Field, type FieldDefinition } from "./fields";
import { valuesOf } from "./groups";
import type { ExplorerOme } from "./omes";
import type { ExplorerData, ExplorerRow } from "./types";

/** No shape encoding - every point is a circle. The value a link carries as ?shape=none. */
export const NO_SHAPE = "none";

export type ShapeBy = Field | typeof NO_SHAPE;

/** Whether ?shape= names a shapeable field. Whether the data fits the scale is shapeOptionsFor's question. */
export const isShapeBy = (value: string | null): value is ShapeBy =>
  value === NO_SHAPE || FIELDS.some(({ key, shapeable }) => shapeable && key === value);

/** The fields an ome could shape by, before its data has a say. */
export const shapeFieldsFor = (ome: ExplorerOme): FieldDefinition[] =>
  fieldsFor(ome).filter(({ shapeable }) => shapeable);

/**
 * Every point's shape when unshaped, and the neutral groups' always. Never given to a value, so a
 * circle always means "no category".
 */
const NEUTRAL_SHAPE: PointShape = "circle";

/** The shapes a field's values draw from, in assignment order. */
const VALUE_SHAPES: readonly PointShape[] = POINT_SHAPES.filter((shape) => shape !== NEUTRAL_SHAPE);

/** How many distinct values a field may have and still be shapeable. */
const SHAPE_CAPACITY = VALUE_SHAPES.length;

export type ShapeScale = ReadonlyMap<string, PointShape>;

/** Every ome's samples. */
const allRows = (data: ExplorerData): ExplorerRow[] => Object.values(data).flatMap(({ rows }) => rows);

/** Which shape each of a field's values takes, assigned across every ome so it holds as you switch. */
export const shapeScale = (data: ExplorerData, field: Field): ShapeScale =>
  new Map(
    valuesOf(allRows(data), field)
      .filter((value) => !isNeutralGroup(value))
      .slice(0, SHAPE_CAPACITY)
      .map((value, index) => [value, VALUE_SHAPES[index]] as const)
  );

/** A group's shape: the neutral one for anything the scale doesn't name. */
export const shapeOf = (scale: ShapeScale | null, group: string | null): PointShape =>
  (group === null ? undefined : scale?.get(group)) ?? NEUTRAL_SHAPE;

/**
 * The fields an ome offers to shape by: those with no more values than there are shapes, rather
 * than repeating shapes. Site is widest today, at exactly six.
 */
export const shapeOptionsFor = (ome: ExplorerOme, data: ExplorerData): FieldDefinition[] =>
  shapeFieldsFor(ome).filter(
    ({ key }) => valuesOf(allRows(data), key).filter((value) => !isNeutralGroup(value)).length <= SHAPE_CAPACITY
  );
