"use client";

import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { ScatterPlot, type Point } from "@weng-lab/visualization";
import { useState, type ReactNode } from "react";
import { CARD_SX } from "./ExplorerLayout";
import { formatTpm } from "./expression";
import { FIELDS, groupOf, labelOf, type Field } from "./fields";
import { METRICS } from "./metrics";
import type { ExplorerRow } from "./types";

/**
 * A chip under the cursor, in whichever of the plot's legends it sits.
 *
 * The field travels with the value because the plot can carry two legends at once - a field it is
 * colored by and another it is shaped by - and "LEO" means nothing without knowing it came from the
 * site row.
 */
export type LegendHover = { field: Field; value: string };

export type PointMeta = {
  row: ExplorerRow;
  /**
   * Whether the sample passes the filters, and so keeps its color. A filtered one is still on the
   * plot, dimmed and drawn beneath the rest - see dimHidden.
   */
  shown: boolean;
  /**
   * The sample's TPM for the gene the plot is colored by, in the API's own units. Carried per point
   * because it is the one thing on the hover that is not on the row: expression is fetched a gene
   * at a time, so a row cannot hold it. Undefined whenever a gene is not what colors the plot.
   */
  expression?: number | null;
};

const MINIMAP = { position: { right: 50, bottom: 50 } };

/** The grouped fields a participant's sample is described by on hover. Protocol is among the details below. */
const TOOLTIP_FIELDS = FIELDS.filter(({ key }) => key !== "protocol");

/** Hover lines after the grouped fields, each skipped where a sample has no value. */
const TOOLTIP_DETAILS: { label: string; value: (row: ExplorerRow) => string | null }[] = [
  { label: "Condition", value: (row) => row.condition },
  { label: "Protocol", value: (row) => row.protocol && labelOf("protocol", row.protocol) },
  { label: "Kit", value: (row) => row.kit },
  { label: "Participant", value: (row) => row.participant_id },
  { label: "Visit", value: (row) => row.visit },
  ...METRICS.map(({ key, label, format }) => ({
    label,
    value: (row: ExplorerRow) => {
      const metric = row.metrics?.[key];
      return metric === null || metric === undefined ? null : format(metric);
    },
  })),
];

type TooltipBodyProps = {
  row: ExplorerRow;
  dimmed: boolean;
  /** The gene colouring the plot and this sample's value for it, or null when none is. */
  expression: { gene: string; tpm: number | null } | null;
};

const TooltipBody = ({ row, dimmed, expression }: TooltipBodyProps) => (
  <Box sx={{ p: 1 }}>
    <Typography variant="body2">
      <strong>{row.sample_id}</strong>
    </Typography>
    {/*
      A dimmed sample says so. The plot hit-tests in draw order, so a dimmed point within a few
      pixels of one in focus is the one the cursor finds, and without this line the reader is left
      wondering why the colored point they aimed at named a sample they had filtered out.
    */}
    {dimmed && (
      <Typography variant="caption" display="block" color="text.secondary" fontStyle="italic">
        Hidden by the current filters
      </Typography>
    )}
    {/* A QC sample would read "QC / Reference" four times over. */}
    {row.qc ? (
      <Typography variant="caption" display="block">
        QC / reference sample
      </Typography>
    ) : (
      TOOLTIP_FIELDS.map(({ key, label }) => (
        <Typography key={key} variant="caption" display="block">
          {label}: {labelOf(key, groupOf(key, row))}
        </Typography>
      ))
    )}
    {TOOLTIP_DETAILS.map(({ label, value }) => {
      const text = value(row);
      return (
        text && (
          <Typography key={label} variant="caption" display="block">
            {label}: {text}
          </Typography>
        )
      );
    })}
    {/*
      Last, and unlike the lines above it is shown even when there is no value: the reader put this
      gene on the plot, so "no value" is an answer about it, where a blank line would leave the grey
      point unexplained.
    */}
    {expression && (
      <Typography variant="caption" display="block">
        {expression.gene}: {expression.tpm === null ? "no value" : formatTpm(expression.tpm)}
      </Typography>
    )}
  </Box>
);

export type ExplorerPlotProps = {
  title: string;
  subtitle: string;
  /**
   * Remounts the plot when it changes, which resets its zoom: a new ome, method or pair of axes is
   * a different plot, not a new view of the old one.
   */
  viewKey: string;
  /** Every point on the plot, the dimmed ones first - what dimHidden returns. */
  points: Point<PointMeta>[];
  /** The subset that passes the filters and keeps its color, in the order it came in. */
  shown: Point<PointMeta>[];
  domains?: { xDomain: [number, number]; yDomain: [number, number] };
  xLabel: string;
  yLabel: string;
  /**
   * Chips for a field, or a colorbar for a metric, built for the hover the plot is reporting:
   * `hovered` is the sample under the cursor, from which the legend takes what it needs - a group
   * to ring among the chips, or a value to mark on the colorbar - and `legendHover` is the chip
   * under the cursor, which the caller renders as it likes.
   *
   * Taken as a function, and the hover state kept here rather than above, because a hover must not
   * re-render whatever computes `points` and `domains`: React Compiler puts every value in a scope
   * together with the hover state it sits beside, so a hover there rebuilds those arrays, and
   * ScatterPlot cancels its 120ms hover growth when they change identity. The hover then draws at
   * zero growth, ringed at a tenth of its opacity, while the same hover from a chip animates in
   * full.
   */
  renderLegend: (hover: {
    hovered: ExplorerRow | null;
    legendHover: LegendHover | null;
    onLegendHover: (hover: LegendHover | null) => void;
  }) => ReactNode;
  /** The gene each point's `expression` belongs to, where one colors the plot. */
  expressionGene?: string | null;
  downloadFileName: string;
};

const ExplorerPlot = ({
  title,
  subtitle,
  viewKey,
  points,
  shown,
  domains,
  xLabel,
  yLabel,
  renderLegend,
  expressionGene,
  downloadFileName,
}: ExplorerPlotProps) => {
  // The highlight runs both ways, as on the WGS page. plotHover is the sample under the cursor,
  // which rings its group's chip or marks its value on the colorbar; legendHover is the chip under
  // the cursor, handed back to the plot so its group swells. Kept apart so neither can feed the
  // other back into itself.
  const [plotHover, setPlotHover] = useState<ExplorerRow | null>(null);
  const [legendHover, setLegendHover] = useState<LegendHover | null>(null);

  // From the points in focus rather than every point, so hovering the chip of a group that is
  // filtered out highlights nothing: its samples are on the plot, but as background.
  //
  // Read off the row by the chip's own field, so a chip in the shape legend and one in the color
  // legend are the same lookup - and a shape chip highlights even while a metric or a gene colors
  // the points.
  const hoveredPoints = legendHover
    ? shown.filter((point) => groupOf(legendHover.field, point.metaData!.row) === legendHover.value)
    : undefined;

  return (
    <Paper
      variant="outlined"
      sx={{ ...CARD_SX, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden", borderRadius: 2 }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1.5}
        sx={{ px: 2, py: 1, bgcolor: "surface.light", borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
      >
        <Box minWidth={0}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {subtitle}
          </Typography>
        </Box>
        <Chip
          size="small"
          // Fixed locale: this renders on the server too, and the browser's own locale would
          // separate the thousands differently and fail hydration.
          label={`${shown.length.toLocaleString("en-US")} / ${points.length.toLocaleString("en-US")} samples`}
          sx={{ flexShrink: 0 }}
        />
      </Stack>

      <Stack gap={1} sx={{ px: 1.5, pt: 1.25, pb: 1.5, flex: 1, minHeight: 0 }}>
        {renderLegend({ hovered: plotHover, legendHover, onLegendHover: setLegendHover })}
        <Box flex={1} minHeight={0} position="relative">
          <ScatterPlot
            key={viewKey}
            pointData={points}
            loading={false}
            {...domains}
            bottomAxisLabel={xLabel}
            leftAxisLabel={yLabel}
            tooltipBody={(point) => (
              <TooltipBody
                row={point.metaData!.row}
                dimmed={!point.metaData!.shown}
                expression={expressionGene ? { gene: expressionGene, tpm: point.metaData!.expression ?? null } : null}
              />
            )}
            hoveredPoints={hoveredPoints}
            onHoveredPointChange={(point) => setPlotHover(point?.metaData?.row ?? null)}
            // No groupPointsAnchor. A hovered point names its groups by ringing their chips, in the
            // shape row and the color row alike; swelling its group on the plot as well could only
            // follow one of the two fields, and would favour color over shape. Showing a whole group
            // is left to its chip.
            controlsPosition={"right"}
            miniMap={MINIMAP}
            downloadButton
            downloadFileName={downloadFileName}
          />
          {shown.length === 0 && (
            <Stack
              position="absolute"
              alignItems="center"
              justifyContent="center"
              sx={{ inset: 0, pointerEvents: "none" }}
            >
              {/* Backed, because the dimmed samples are still drawn underneath this message. */}
              <Typography
                color="text.secondary"
                sx={{ px: 2, py: 1, borderRadius: 1, bgcolor: "background.paper", boxShadow: 1 }}
              >
                {points.length === 0 ? "No samples to plot" : "No samples match the current filters"}
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default ExplorerPlot;
