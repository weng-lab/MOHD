"use client";

import { getShapePoints, type PointShape } from "@weng-lab/visualization";

/**
 * The scatter plot's point shapes, drawn at legend size.
 *
 * Geometry comes from the plotting library rather than a set of hand-written paths here, so the
 * key and the points it explains cannot drift apart - the library sizes every shape to the same
 * area, which is what keeps one glyph in a row from reading as heavier than its neighbours.
 */
export type ShapeGlyphProps = {
  shape: PointShape;
  color: string;
  /** Outlined rather than filled, for a value switched off. */
  hollow?: boolean;
  size?: number;
};

/**
 * Radius the shapes are drawn at, as a fraction of the box.
 *
 * The widest shape is the X, whose points sit √2 further out than the cross it is turned from, at
 * about 1.68r. Sizing to that keeps every glyph inside the box without clipping the corners.
 */
const RADIUS_RATIO = 1 / 1.75;

const ShapeGlyph = ({ shape, color, hollow = false, size = 12 }: ShapeGlyphProps) => {
  const center = size / 2;
  const radius = center * RADIUS_RATIO;
  const points = getShapePoints(shape, center, center, radius);
  const fill = hollow ? "transparent" : color;
  // Thin enough that the cross and X read as glyphs rather than blobs at this size.
  const stroke = { stroke: color, strokeWidth: 1.5 };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      {points ? (
        <polygon points={points} fill={fill} {...stroke} strokeLinejoin="round" />
      ) : (
        <circle cx={center} cy={center} r={radius} fill={fill} {...stroke} />
      )}
    </svg>
  );
};

export default ShapeGlyph;
