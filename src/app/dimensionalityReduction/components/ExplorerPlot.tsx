"use client";

import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { ScatterPlot, type Point } from "@weng-lab/visualization";
import { useState, type ReactNode } from "react";
import { spotlight } from "@/common/components/plotDimming";
import type { ColorRange, RampRange } from "@/common/legends";
import { PLOT_HEADER_SX } from "@/common/components/plotHeaderSx";
import PlotTooltip from "@/common/components/PlotTooltip";
import { CARD_SX } from "./dimensions";
import { FIELDS, groupOf, labelOf, tooltipRowsOf, type Field } from "@/common/sampleFields/fields";
import { METRICS } from "../model/metrics";
import type { ExplorerRow } from "../model/types";

/**
 * The part of a legend under the cursor: a chip, with its field since the color and shape legends
 * can both show, or a stretch of the colorbar - `sweep` to draw on the bar, and `within`, the values
 * it takes in, in the units of each point's `rampValue`.
 */
export type LegendHover =
  { kind: "group"; field: Field; value: string } | { kind: "range"; sweep: RampRange; within: ColorRange };

/** A feature coloring the plot, as the hover names it and writes its values. */
export type PlotFeature = { name: string; format: (value: number) => string };

export type PointMeta = {
  row: ExplorerRow;
  /** Whether the sample passes the filters and keeps its color, rather than being dimmed - see dimHidden. */
  shown: boolean;
  /**
   * The sample's value for the feature coloring the plot, in the data's units. Carried per point
   * since features are fetched separately from the rows. Null where there's no value or no feature.
   */
  featureValue: number | null;
  /**
   * The sample's value on the ramp coloring the plot, in the ramp's units (log10(value + 1) for a
   * feature): what a colorbar sweep matches against. Null while a field colors the plot, or with no value.
   */
  rampValue: number | null;
};

const MINIMAP = { position: { right: 50, bottom: 50 } };

/** The grouped fields a participant's sample is described by on hover. Protocol is among the details below. */
const TOOLTIP_FIELDS = FIELDS.filter(({ key }) => key !== "protocol");

/** Hover lines after the grouped fields, each skipped where a sample has no value. */
const TOOLTIP_DETAILS: { label: string; value: (row: ExplorerRow) => string | null }[] = [
  { label: "Condition", value: (row) => row.condition },
  { label: "Protocol", value: (row) => row.protocol && labelOf("protocol", row.protocol) },
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
  /** The feature coloring the plot and this sample's value for it, or null when none is. */
  feature: (PlotFeature & { value: number | null }) | null;
};

const TooltipBody = ({ row, dimmed, feature }: TooltipBodyProps) => (
  <PlotTooltip
    title={row.sample_id}
    // Dimmed points can win the hit test, so a dimmed sample says it's hidden.
    note={dimmed ? "Hidden by the current filters" : undefined}
    rows={[
      ...tooltipRowsOf(TOOLTIP_FIELDS, row),
      ...TOOLTIP_DETAILS.flatMap(({ label, value }) => {
        const text = value(row);
        return text ? [{ label, value: text }] : [];
      }),
      // Shown even with no value: it explains why the point is gray.
      ...(feature
        ? [{ label: feature.name, value: feature.value === null ? "no value" : feature.format(feature.value) }]
        : []),
    ]}
  />
);

export type ExplorerPlotProps = {
  title: string;
  subtitle: string;
  /** Remounts the plot, resetting its zoom, for a new ome, method or pair of axes. */
  viewKey: string;
  /** Every point on the plot, the dimmed ones first - what dimHidden returns. */
  points: Point<PointMeta>[];
  /** The subset that passes the filters and keeps its color, in the order it came in. */
  shown: Point<PointMeta>[];
  domains?: { xDomain: [number, number]; yDomain: [number, number] };
  xLabel: string;
  yLabel: string;
  /**
   * The legend, built for the current hover: `hovered` is the sample under the cursor (a chip to
   * ring, or a value to mark), and `onLegendHover` reports the chip or colorbar stretch under it.
   *
   * A render function so the hover state lives here, not in whatever computes `points`: React
   * Compiler would rebuild those on every hover, restarting ScatterPlot's hover animation.
   */
  renderLegend: (hover: {
    hovered: ExplorerRow | null;
    legendHover: LegendHover | null;
    onLegendHover: (hover: LegendHover | null) => void;
  }) => ReactNode;
  /** What each point's `featureValue` is a value of, where a feature colors the plot. */
  feature: PlotFeature | null;
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
  feature,
  downloadFileName,
}: ExplorerPlotProps) => {
  // Highlighting runs both ways: a hovered point marks the legend, and a hovered chip or colorbar
  // stretch swells its points. Separate states, so neither feeds back into the other.
  const [plotHover, setPlotHover] = useState<ExplorerRow | null>(null);
  const [legendHover, setLegendHover] = useState<LegendHover | null>(null);

  // Only points in focus, so a filtered-out group's chip highlights nothing. A chip is matched by its
  // own field, so shape chips work whatever colors the points.
  const hoveredPoints =
    legendHover === null
      ? undefined
      : legendHover.kind === "group"
        ? shown.filter((point) => groupOf(legendHover.field, point.metaData!.row) === legendHover.value)
        : shown.filter(({ metaData }) => {
            const value = metaData!.rampValue;
            const [low, high] = legendHover.within;
            return value !== null && value >= low && value <= high;
          });
  // The rest dimmed around them. A colorbar window dims everything outside it even while empty, as
  // the heatmap's sweep does; a chip with nothing in focus - one switched off - leaves the plot be.
  const highlighted =
    hoveredPoints && (hoveredPoints.length > 0 || legendHover?.kind === "range") ? hoveredPoints : null;

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
        sx={{ px: 2, py: 1, ...PLOT_HEADER_SX }}
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
          // Fixed locale, so server and client render the same.
          label={`${shown.length.toLocaleString("en-US")} / ${points.length.toLocaleString("en-US")} samples`}
          sx={{ flexShrink: 0 }}
        />
      </Stack>

      <Stack gap={1} sx={{ px: 1.5, pt: 1.25, pb: 1.5, flex: 1, minHeight: 0 }}>
        {renderLegend({ hovered: plotHover, legendHover, onLegendHover: setLegendHover })}
        <Box flex={1} minHeight={0} position="relative">
          <ScatterPlot
            key={viewKey}
            pointData={spotlight(points, highlighted)}
            loading={false}
            {...domains}
            bottomAxisLabel={xLabel}
            leftAxisLabel={yLabel}
            tooltipBody={(point) => (
              <TooltipBody
                row={point.metaData!.row}
                dimmed={!point.metaData!.shown}
                feature={feature && { ...feature, value: point.metaData!.featureValue }}
              />
            )}
            hoveredPoints={hoveredPoints}
            onHoveredPointChange={(point) => setPlotHover(point?.metaData?.row ?? null)}
            // No groupPointsAnchor: it could only swell one of the color and shape groups; the chips show both.
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
              {/* Backed, since the dimmed samples are drawn underneath. */}
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
