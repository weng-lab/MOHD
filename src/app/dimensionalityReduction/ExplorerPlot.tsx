"use client";

import { Box, Chip, Paper, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ScatterPlot, type Point } from "@weng-lab/visualization";
import { useState, type ReactNode } from "react";
import { CARD_SX } from "./ExplorerLayout";
import { FIELDS, groupOf, labelOf } from "./fields";
import { METRICS } from "./metrics";
import type { ExplorerRow } from "./types";

export type PointMeta = {
  row: ExplorerRow;
  /**
   * The row's group for the field the plot is colored by - what the legend and both hovers key on.
   * Null while a metric colors the plot, which has no groups.
   */
  group: string | null;
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

const TooltipBody = ({ row }: { row: ExplorerRow }) => (
  <Box sx={{ p: 1 }}>
    <Typography variant="body2">
      <strong>{row.sample_id}</strong>
    </Typography>
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
  /** The points that pass the filters. */
  points: Point<PointMeta>[];
  /** Samples on the plot before filtering. */
  total: number;
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
    legendHover: string | null;
    onLegendHover: (value: string | null) => void;
  }) => ReactNode;
  /**
   * Whether points belong to groups, so that hovering one swells its whole group. Off for a
   * metric, where every point would otherwise be in the one null group.
   */
  grouped: boolean;
  downloadFileName: string;
};

const ExplorerPlot = ({
  title,
  subtitle,
  viewKey,
  points,
  total,
  domains,
  xLabel,
  yLabel,
  renderLegend,
  grouped,
  downloadFileName,
}: ExplorerPlotProps) => {
  const theme = useTheme();
  // Below md the plot is too narrow for controls on the left not to cover the y axis label.
  const narrow = useMediaQuery(theme.breakpoints.down("md"));
  // The highlight runs both ways, as on the WGS page. plotHover is the sample under the cursor,
  // which rings its group's chip or marks its value on the colorbar; legendHover is the chip under
  // the cursor, handed back to the plot so its group swells. Kept apart so neither can feed the
  // other back into itself.
  const [plotHover, setPlotHover] = useState<ExplorerRow | null>(null);
  const [legendHover, setLegendHover] = useState<string | null>(null);

  // From the points on the plot, which are the visible ones, so hovering the chip of a hidden
  // group highlights nothing.
  const hoveredPoints =
    legendHover && grouped ? points.filter((point) => point.metaData!.group === legendHover) : undefined;

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
          label={`${points.length.toLocaleString("en-US")} / ${total.toLocaleString("en-US")} samples`}
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
            tooltipBody={(point) => <TooltipBody row={point.metaData!.row} />}
            hoveredPoints={hoveredPoints}
            onHoveredPointChange={(point) => setPlotHover(point?.metaData?.row ?? null)}
            groupPointsAnchor={grouped ? "group" : undefined}
            controlsPosition={narrow ? "right" : "left"}
            miniMap={MINIMAP}
            downloadButton
            downloadFileName={downloadFileName}
          />
          {points.length === 0 && (
            <Stack
              position="absolute"
              alignItems="center"
              justifyContent="center"
              sx={{ inset: 0, pointerEvents: "none" }}
            >
              <Typography color="text.secondary">No samples match the current filters</Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default ExplorerPlot;
