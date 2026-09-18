/**
 * The plot's second categorical encoding: which field decides a point's shape.
 *
 * Kept apart from the color in fields.ts because the two answer different questions. Color can
 * carry order along a ramp, so it takes age; shape is unordered and readable only a few categories
 * deep, so it takes the fields FIELDS marks `shapeable` and nothing else.
 */

import { POINT_SHAPES, type PointShape } from "@weng-lab/visualization";
import { FIELDS, fieldsFor, isNeutralGroup, type Field, type FieldDefinition } from "./fields";
import { valuesOf } from "./groups";
import type { ExplorerOme } from "./omes";
import type { ExplorerData, ExplorerRow } from "./types";

/** No shape encoding - every point is a circle. The value a link carries as ?shape=none. */
export const NO_SHAPE = "none";

export type ShapeBy = Field | typeof NO_SHAPE;

/**
 * Whether a link's ?shape= names something shapeable at all. Static, because a URL is read before
 * any data is in hand; whether the data then fits the scale is shapeOptionsFor's question.
 */
export const isShapeBy = (value: string | null): value is ShapeBy =>
  value === NO_SHAPE || FIELDS.some(({ key, shapeable }) => shapeable && key === value);

/** The fields an ome could shape by, before its data has a say. */
export const shapeFieldsFor = (ome: ExplorerOme): FieldDefinition[] =>
  fieldsFor(ome).filter(({ shapeable }) => shapeable);

/**
 * The shape a point takes when nothing about it is being encoded: the default, and what QC and
 * "Unknown" samples keep however the plot is shaped.
 *
 * Held out of the scale below rather than handed to a value, so a circle always means "no category
 * here" - otherwise a grey QC point and the first site would be the same glyph, and the two are
 * told apart only by a color that filtering fades away.
 */
const NEUTRAL_SHAPE: PointShape = "circle";

/** The shapes a field's values draw from, in assignment order. */
const VALUE_SHAPES: readonly PointShape[] = POINT_SHAPES.filter((shape) => shape !== NEUTRAL_SHAPE);

/** How many distinct values a field may have and still be shapeable. */
export const SHAPE_CAPACITY = VALUE_SHAPES.length;

export type ShapeScale = ReadonlyMap<string, PointShape>;

/** Every ome's samples, which is what lets one scale cover all of them. */
const allRows = (data: ExplorerData): ExplorerRow[] => Object.values(data).flatMap(({ rows }) => rows);

/**
 * Which shape each of a field's values takes.
 *
 * Assigned across every ome's samples rather than the one on screen, so a value keeps its shape as
 * you switch omes - the same property the fixed color palettes give, arrived at differently
 * because there is no palette to look a shape up in.
 */
export const shapeScale = (data: ExplorerData, field: Field): ShapeScale =>
  new Map(
    valuesOf(allRows(data), field)
      .filter((value) => !isNeutralGroup(value))
      .slice(0, SHAPE_CAPACITY)
      .map((value, index) => [value, VALUE_SHAPES[index]] as const)
  );

/** A group's shape: the neutral one for anything the scale does not name. */
export const shapeOf = (scale: ShapeScale | null, group: string | null): PointShape =>
  (group === null ? undefined : scale?.get(group)) ?? NEUTRAL_SHAPE;

/**
 * The fields an ome offers to shape by.
 *
 * A field with more values than there are shapes is dropped rather than encoded with repeats,
 * which would draw two categories identically and say nothing about it. Nothing reaches that today
 * - site is the widest at six, exactly the scale - so this guards a field growing a value later.
 */
export const shapeOptionsFor = (ome: ExplorerOme, data: ExplorerData): FieldDefinition[] =>
  shapeFieldsFor(ome).filter(
    ({ key }) => valuesOf(allRows(data), key).filter((value) => !isNeutralGroup(value)).length <= SHAPE_CAPACITY
  );
