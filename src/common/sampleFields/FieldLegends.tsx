"use client";

import ShapeLegend from "@/common/components/ShapeLegend";
import { shapeOf } from "@/common/components/pointShapes";
import { ChipLegend } from "@weng-lab/visualization";
import { QC_GROUP, type Field, type SampleGroups } from "./fields";
import { legendGroups, type Filters } from "./groups";
import type { Shaping } from "./shapes";

/** A chip under the cursor, with its field, since the color and shape rows can both show. */
export type GroupHover = { field: Field; value: string };

export type FieldLegendsProps = {
  rows: readonly SampleGroups[];
  filters: Filters;
  /** The field coloring the plot, or null where a colorbar stands in for its chips. */
  color: { key: Field; label: string } | null;
  shape: Shaping | null;
  /** A chip clicked. The QC chip's value is QC_GROUP, which stands for the QC samples on any field. */
  onToggle: (field: Field, value: string) => void;
  /** The chip to ring in a field's row: the hovered sample's group, or the hovered chip. */
  ringed: (field: Field) => string | null;
  onHover: (hover: GroupHover | null) => void;
};

/**
 * The chip legends for the fields coloring and shaping a plot. Shape gets a row of its own only
 * where it names another field; otherwise the color chips carry the glyphs. Both rows toggle the
 * same per-field filters.
 */
const FieldLegends = ({ rows, filters, color, shape, onToggle, ringed, onHover }: FieldLegendsProps) => {
  const shapeRow = shape && shape.key !== color?.key ? shape : null;
  const hover = (field: Field) => (value: string | null) => onHover(value === null ? null : { field, value });
  // The QC chip stands for hideQc, whichever row it's in.
  const hiddenOf = (field: Field) =>
    filters.hideQc ? new Set([...filters.hidden[field], QC_GROUP]) : filters.hidden[field];

  return (
    <>
      {shapeRow && (
        <ShapeLegend
          label={shapeRow.label}
          scale={shapeRow.scale}
          groups={legendGroups(rows, shapeRow.key, filters)}
          hidden={hiddenOf(shapeRow.key)}
          onToggle={(value) => onToggle(shapeRow.key, value)}
          highlighted={ringed(shapeRow.key)}
          onHover={hover(shapeRow.key)}
        />
      )}
      {color && (
        <ChipLegend
          // Named only beneath a shape row, to tell the two apart.
          label={shapeRow ? color.label : undefined}
          groups={legendGroups(rows, color.key, filters).map((group) =>
            shape?.key === color.key ? { ...group, shape: shapeOf(shape.scale, group.value) } : group
          )}
          hidden={hiddenOf(color.key)}
          onToggle={(value) => onToggle(color.key, value)}
          highlighted={ringed(color.key)}
          onHover={hover(color.key)}
        />
      )}
    </>
  );
};

export default FieldLegends;
