/** Shape as a second categorical encoding, for the few-valued, unordered fields FIELDS marks `shapeable`. */

import { shapeScaleOf, type ShapeScale } from "@/common/components/pointShapes";
import type { OmesDataType } from "@/common/types/globalTypes";
import { FIELDS, fieldsFor, isNeutralGroup, type Field, type FieldDefinition, type SampleGroups } from "./fields";
import { valuesOf } from "./groups";

/** No shape encoding - every point is a circle. The explorer's links carry it as ?shape=none. */
export const NO_SHAPE = "none";

export type ShapeBy = Field | typeof NO_SHAPE;

/** Whether a value names a shapeable field. Whether the data fits the scale is shapeOptions' question. */
export const isShapeBy = (value: string | null): value is ShapeBy =>
  value === NO_SHAPE || FIELDS.some(({ key, shapeable }) => shapeable && key === value);

/** The fields an ome could shape by, before its data has a say. */
export const shapeFieldsFor = (ome: OmesDataType): FieldDefinition[] =>
  fieldsFor(ome).filter(({ shapeable }) => shapeable);

/** Which shape each of a field's values takes across these samples, or null if there are too many. */
export const shapeScale = (rows: readonly SampleGroups[], field: Field): ShapeScale | null =>
  shapeScaleOf(valuesOf(rows, field).filter((value) => !isNeutralGroup(value)));

/**
 * Of these fields, the ones to offer to shape by: shapeable, and with no more values across these
 * samples than there are shapes. Site is widest today, at exactly six.
 */
export const shapeOptions = (fields: readonly FieldDefinition[], rows: readonly SampleGroups[]): FieldDefinition[] =>
  fields.filter(({ key, shapeable }) => shapeable && shapeScale(rows, key) !== null);

/** A field a plot is shaped by, and the shape each of its values takes. */
export type Shaping = { key: Field; label: string; scale: ShapeScale };

/**
 * What `shape` asks to shape by, if it's one of `options` - see shapeOptions. Null for no shape, and
 * for a field these samples have outgrown, which a link made before can still name.
 */
export const shapingOf = (
  shape: ShapeBy,
  options: readonly FieldDefinition[],
  rows: readonly SampleGroups[]
): Shaping | null => {
  const field = shape === NO_SHAPE ? undefined : options.find(({ key }) => key === shape);
  const scale = field && shapeScale(rows, field.key);
  return field && scale ? { key: field.key, label: field.label, scale } : null;
};
