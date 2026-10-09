"use client";

import { Box, MenuItem, Paper, Stack, TextField } from "@mui/material";
import { useState, type ReactNode, type RefObject } from "react";
import PlotHeader, { PlotHeaderTitle } from "@/common/components/PlotHeader";
import { HEADER_SELECT_SX } from "@/common/components/plotHeaderSx";
import ShapeLegend from "@/common/components/ShapeLegend";
import { shapeOf, type ShapeScale } from "@/common/components/pointShapes";
import { ChipLegend, type LegendGroup } from "@weng-lab/visualization";
import { CARD_SX } from "./dimensions";
import type { ColorField, ColorOption } from "./fields";
import type { GroupInfo } from "./groups";
import PrivacyBinNote from "./PrivacyBinNote";

/** The shape select's value for no shape encoding. No field is named this. */
const NO_SHAPE = "none";

/** One row of chips: the field's groups, which are switched off, and what a click does. */
export type LegendRow = {
  /** The field's name, shown beside its chips while there are two rows. */
  label: string;
  groups: GroupInfo[];
  hidden: ReadonlySet<string>;
  onToggle: (value: string) => void;
};

/** A row's groups as chips: the privacy bin names the categories it folds together on hover. */
const chipGroups = (groups: GroupInfo[]): LegendGroup[] =>
  groups.map(({ members, ...group }) => ({
    ...group,
    tooltip: members?.length ? <PrivacyBinNote members={members} /> : undefined,
  }));

/** A chip under the cursor, and which legend it's in. */
export type LegendHover = { legend: "color" | "shape"; value: string };

/** The groups of the point under the cursor, whose chips to ring. `shapeGroup` is null while nothing shapes the plot. */
export type PlotHover = { group: string; shapeGroup: string | null };

/**
 * Generic over the field rather than the row type: the row never reaches this component, and the
 * props below are the only ones that have to agree with each other.
 */
export type PlotCardProps<K extends ColorField> = {
  /** Cohort name, shown in the header. */
  title: string;
  /** Samples in focus, shown beside the title. */
  shown: number;
  /** Samples on the plot, the dimmed ones included. Named beside `shown` only while the two differ. */
  total: number;
  /** Fields this cohort can be colored and shaped by. */
  options: readonly ColorOption<K>[];
  colorBy: K;
  onColorByChange: (key: K) => void;
  shapeBy: K | null;
  onShapeByChange: (key: K | null) => void;
  /** Whether a field can be shaped by: not age, with its order, and not one with too many values. Only these are listed. */
  canShape: (key: K) => boolean;
  color: LegendRow;
  /** While the plot is shaped. Merged into the color chips where both name the same field. */
  shape: (LegendRow & { scale: ShapeScale }) | null;
  /** Measured by the parent so both plots can be given one shared size. */
  plotRef: RefObject<HTMLDivElement | null>;
  /**
   * The plot, built for the hover this card is tracking: `legendHover` is the chip under the cursor,
   * whose group the plot renders as `hoveredPoints`, and `onPlotHover` is what it calls with the
   * groups of the point under its own cursor.
   *
   * Taken as a function, and the hover state kept here rather than on the page, because a hover
   * must not re-render whatever builds the points. React Compiler memoizes in scopes and puts
   * neighboring values in one together, so hover state beside the point math gates it: every
   * chip the cursor crosses then rebuilds both cohorts' pointData. ScatterPlot cancels its 120ms
   * hover growth when pointData changes identity mid-animation, which is one stray re-render away
   * from a highlight that never grows - see ExplorerPlot, where that bug was found.
   */
  children: (hover: { legendHover: LegendHover | null; onPlotHover: (hover: PlotHover | null) => void }) => ReactNode;
};

/**
 * One cohort's pane: header, legends and plot inside a single border.
 *
 * The "color by" and "shape by" selects sit in the card header rather than in a page-level
 * toolbar. With both cohorts on screen a shared toolbar leaves the reader matching each select to
 * its plot by reading its label; inside the border there is only one plot it can belong to, at
 * every breakpoint.
 *
 * The axis selects stay outside this component for the same reason: they drive both plots through
 * ScatterPlotSync, so they must not sit inside either card.
 */
const PlotCard = <K extends ColorField>({
  title,
  shown,
  total,
  options,
  colorBy,
  onColorByChange,
  shapeBy,
  onShapeByChange,
  canShape,
  color,
  shape,
  plotRef,
  children,
}: PlotCardProps<K>) => {
  // The highlight runs both ways. plotHover is the point under the cursor in the plot, which rings
  // its chips; legendHover is the chip under the cursor, handed back to the plot so its group
  // swells. Only one can be set at a time - reaching a chip means leaving the plot - but they are
  // kept apart so neither can feed the other back into itself.
  //
  // Only a chip swells a group. A hovered point grows alone and names its groups by ringing their
  // chips, as on the dimensionality reduction explorer: a point sits in a group in both the color
  // and the shape legend, and swelling either one on the plot would favor it over the other.
  const [plotHover, setPlotHover] = useState<PlotHover | null>(null);
  const [legendHover, setLegendHover] = useState<LegendHover | null>(null);

  // A row of its own only for another field; otherwise the color chips carry the glyphs.
  const shapeRow = shape && shapeBy !== colorBy ? shape : null;
  const ringed = (legend: LegendHover["legend"]) =>
    plotHover
      ? legend === "color"
        ? plotHover.group
        : plotHover.shapeGroup
      : legendHover?.legend === legend
        ? legendHover.value
        : null;
  const hover = (legend: LegendHover["legend"]) => (value: string | null) =>
    setLegendHover(value === null ? null : { legend, value });

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        borderRadius: 2,
        ...CARD_SX,
      }}
    >
      <PlotHeader
        title={<PlotHeaderTitle title={title} shown={shown} total={total} />}
        controls={
          <>
            <TextField
              select
              size="small"
              label="Color by"
              value={String(colorBy)}
              onChange={(e) => onColorByChange(e.target.value as K)}
              sx={{ ...HEADER_SELECT_SX, minWidth: 180 }}
            >
              {options.map((o) => (
                <MenuItem key={String(o.key)} value={String(o.key)}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Shape by"
              value={shapeBy === null ? NO_SHAPE : String(shapeBy)}
              onChange={(e) => onShapeByChange(e.target.value === NO_SHAPE ? null : (e.target.value as K))}
              sx={HEADER_SELECT_SX}
            >
              <MenuItem value={NO_SHAPE}>None</MenuItem>
              {options
                .filter((o) => canShape(o.key))
                .map((o) => (
                  <MenuItem key={String(o.key)} value={String(o.key)}>
                    {o.label}
                  </MenuItem>
                ))}
            </TextField>
          </>
        }
      />

      <Stack gap={1} sx={{ px: 1.5, pt: 1.25, pb: 1.5, flex: 1, minHeight: 0 }}>
        {shapeRow && (
          <ShapeLegend
            label={shapeRow.label}
            scale={shapeRow.scale}
            groups={chipGroups(shapeRow.groups)}
            hidden={shapeRow.hidden}
            onToggle={shapeRow.onToggle}
            highlighted={ringed("shape")}
            onHover={hover("shape")}
          />
        )}
        <ChipLegend
          // Named only beneath a shape row, to tell the two apart.
          label={shapeRow ? color.label : undefined}
          groups={
            shape && !shapeRow
              ? chipGroups(color.groups).map((group) => ({ ...group, shape: shapeOf(shape.scale, group.value) }))
              : chipGroups(color.groups)
          }
          hidden={color.hidden}
          onToggle={color.onToggle}
          highlighted={ringed("color")}
          onHover={hover("color")}
          scrollable
        />
        {/*
        Bottom-aligned, not centered. Both plots render at the smaller of the two containers, so
        the card with the shorter legend has room to spare below its plot. Pinning the plot to
        the bottom puts both x-axes on the same line, which is what makes the two cohorts
        readable side by side.
      */}
        <Box ref={plotRef} flex={1} minHeight={0} display="flex" flexDirection="column" justifyContent="flex-end">
          {children({ legendHover, onPlotHover: setPlotHover })}
        </Box>
      </Stack>
    </Paper>
  );
};

export default PlotCard;
