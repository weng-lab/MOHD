"use client";

import { ChipLegend, type LegendGroup } from "@weng-lab/visualization";
import { shapeOf, type ShapeScale } from "./pointShapes";

export type ShapeLegendProps = {
  /** The field's name, labeling the row so it isn't mistaken for the color legend. */
  label: string;
  scale: ShapeScale;
  /** The field's groups, as its color legend would list them. */
  groups: LegendGroup[];
  hidden: ReadonlySet<string>;
  onToggle: (value: string) => void;
  highlighted?: string | null;
  onHover?: (value: string | null) => void;
};

/** In ink rather than the field's palette: the points are colored by another field. */
const GLYPH_INK = "currentColor";

/**
 * The legend for the shape encoding, shown while the plot is shaped and colored by different fields
 * (otherwise the color chips carry the glyphs). Its chips toggle the field's filter, as color chips
 * do, and list every group the color legend would: those the scale doesn't name are circles.
 */
const ShapeLegend = ({ label, scale, groups, hidden, onToggle, highlighted, onHover }: ShapeLegendProps) => (
  <ChipLegend
    label={label}
    groups={groups.map((group) => ({ ...group, shape: shapeOf(scale, group.value), color: GLYPH_INK }))}
    hidden={hidden}
    onToggle={onToggle}
    highlighted={highlighted}
    onHover={onHover}
    scrollable
  />
);

export default ShapeLegend;
