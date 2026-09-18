"use client";

import PlotLegend, { type LegendGroup } from "@/common/components/PlotLegend";
import type { ShapeScale } from "./shapes";

export type ShapeLegendProps = {
  /** The field's name, which labels the row - two rows of chips otherwise look interchangeable. */
  label: string;
  scale: ShapeScale;
  /** The field's groups, as the color legend would build them - see legendGroups. */
  groups: LegendGroup[];
  hidden: ReadonlySet<string>;
  onToggle: (value: string) => void;
  highlighted?: string | null;
  onHover?: (value: string | null) => void;
};

/**
 * The glyph is drawn in ink rather than in the field's palette. The points it explains are colored
 * by a different field, so palette colors here would put a second, contradictory color encoding on
 * the same plot - the shape is the whole of what this row says.
 */
const GLYPH_INK = "currentColor";

/**
 * The legend for the shape encoding, shown only while the plot is shaped by one field and colored
 * by another - where they agree, the color chips carry the glyphs instead and this would say it
 * twice.
 *
 * The same chips as the color legend, and clickable for the same reason: both write to the one set
 * of per-field filters, so hiding a site here and an age band below compose exactly as the panel's
 * own filter buttons do.
 */
const ShapeLegend = ({ label, scale, groups, hidden, onToggle, highlighted, onHover }: ShapeLegendProps) => (
  <PlotLegend
    label={label}
    // Only the values the scale names. QC and Unknown samples are drawn as circles because they
    // carry no value for this field, not because a circle stands for either of them, so a chip
    // here would claim a meaning the plot does not hold - the color legend below accounts for them.
    // Nothing else is dropped: shapeOptionsFor already refuses a field wider than the scale.
    groups={groups.flatMap((group) => {
      const shape = scale.get(group.value);
      return shape ? [{ ...group, shape, color: GLYPH_INK }] : [];
    })}
    hidden={hidden}
    onToggle={onToggle}
    highlighted={highlighted}
    onHover={onHover}
  />
);

export default ShapeLegend;
