"use client";

import PlotLegend, { type LegendGroup } from "@/common/components/PlotLegend";
import type { ShapeScale } from "../model/shapes";

export type ShapeLegendProps = {
  /** The field's name, labelling the row so it isn't mistaken for the color legend. */
  label: string;
  scale: ShapeScale;
  /** The field's groups, as the color legend would build them - see legendGroups. */
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
 * (otherwise the color chips carry the glyphs). Its chips toggle the same per-field filters.
 */
const ShapeLegend = ({ label, scale, groups, hidden, onToggle, highlighted, onHover }: ShapeLegendProps) => (
  <PlotLegend
    label={label}
    // Only the values the scale names: QC and Unknown are circles for having no value, which the
    // color legend accounts for.
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
