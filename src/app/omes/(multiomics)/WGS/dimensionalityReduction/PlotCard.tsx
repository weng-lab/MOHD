"use client";

import { Box, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState, type ReactNode, type RefObject } from "react";
import PlotLegend from "@/common/components/PlotLegend";
import ShapeLegend from "@/common/components/ShapeLegend";
import { shapeOf, type ShapeScale } from "@/common/components/pointShapes";
import { CARD_SX } from "./dimensions";
import type { ColorField, ColorOption } from "./fields";
import type { GroupInfo } from "./groups";

/** The shape select's value for no shape encoding. No field is named this. */
const NO_SHAPE = "none";

/** Capped at the header's width, so a long value truncates on a phone rather than pushing the card wider. */
const SELECT_SX = { minWidth: 130, maxWidth: "100%", bgcolor: "background.paper" };

/** One row of chips: the field's groups, which are switched off, and what a click does. */
export type LegendRow = {
  /** The field's name, shown beside its chips while there are two rows. */
  label: string;
  groups: GroupInfo[];
  hidden: ReadonlySet<string>;
  onToggle: (value: string) => void;
};

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
  /** Whether a field's values fit the shape scale. The rest are listed disabled, with the reason. */
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
   * neighbouring values in one together, so hover state beside the point maths gates it: every
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
  // and the shape legend, and swelling either one on the plot would favour it over the other.
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
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        columnGap={1.5}
        rowGap={1}
        sx={{
          px: 1.5,
          py: 0.75,
          bgcolor: "surface.light",
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle2" noWrap>
          {title}{" "}
          <Typography component="span" variant="body2" color="text.secondary">
            {/* Fixed locale: this renders on the server too, and the browser's own
              locale would separate the thousands differently and fail hydration.
              Nothing switched off is the common case, and "(1,161 / 1,161)" would
              only make the reader check two numbers to learn that. */}
            ({shown.toLocaleString("en-US")}
            {shown !== total && ` / ${total.toLocaleString("en-US")}`})
          </Typography>
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} maxWidth="100%">
          <TextField
            select
            size="small"
            label="Color by"
            value={String(colorBy)}
            onChange={(e) => onColorByChange(e.target.value as K)}
            sx={{ ...SELECT_SX, minWidth: 180 }}
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
            sx={SELECT_SX}
          >
            <MenuItem value={NO_SHAPE}>None</MenuItem>
            {/* Unshapeable fields are listed disabled with the reason, rather than silently missing. */}
            {options.map((o) => (
              <MenuItem key={String(o.key)} value={String(o.key)} disabled={!canShape(o.key)}>
                {canShape(o.key) ? o.label : `${o.label} — too many values to shape by`}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      <Stack gap={1} sx={{ px: 1.5, pt: 1.25, pb: 1.5, flex: 1, minHeight: 0 }}>
        {shapeRow && (
          <ShapeLegend
            label={shapeRow.label}
            scale={shapeRow.scale}
            groups={shapeRow.groups}
            hidden={shapeRow.hidden}
            onToggle={shapeRow.onToggle}
            highlighted={ringed("shape")}
            onHover={hover("shape")}
          />
        )}
        <PlotLegend
          // Named only beneath a shape row, to tell the two apart.
          label={shapeRow ? color.label : undefined}
          groups={
            shape && !shapeRow
              ? color.groups.map((group) => ({ ...group, shape: shapeOf(shape.scale, group.value) }))
              : color.groups
          }
          hidden={color.hidden}
          onToggle={color.onToggle}
          highlighted={ringed("color")}
          onHover={hover("color")}
        />
        {/*
        Bottom-aligned, not centred. Both plots render at the smaller of the two containers, so
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
