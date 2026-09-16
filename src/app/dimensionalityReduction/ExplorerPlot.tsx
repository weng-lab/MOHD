"use client";

import { Box, Chip, Paper, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ScatterPlot, type Point } from "@weng-lab/visualization";
import PlotLegend, { type LegendGroup } from "@/common/components/PlotLegend";
import { CARD_SX } from "./ExplorerLayout";
import { FIELDS, groupOf, labelOf } from "./fields";
import type { ExplorerRow } from "./types";

export type PointMeta = {
  row: ExplorerRow;
  /** The row's group for the field the plot is colored by. The legend and both hovers key on it. */
  group: string;
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
  groups: LegendGroup[];
  hidden: ReadonlySet<string>;
  onToggle: (value: string) => void;
  /** Group to ring in the legend, from either the plot's hover or a chip's. */
  highlighted: string | null;
  onLegendHover: (value: string | null) => void;
  /** Points to swell, for the chip under the cursor. */
  hoveredPoints?: Point<PointMeta>[];
  onPlotHover: (group: string | null) => void;
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
  groups,
  hidden,
  onToggle,
  highlighted,
  onLegendHover,
  hoveredPoints,
  onPlotHover,
  downloadFileName,
}: ExplorerPlotProps) => {
  const theme = useTheme();
  // Below md the plot is too narrow for controls on the left not to cover the y axis label.
  const narrow = useMediaQuery(theme.breakpoints.down("md"));

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
        <PlotLegend
          groups={groups}
          hidden={hidden}
          onToggle={onToggle}
          highlighted={highlighted}
          onHover={onLegendHover}
        />
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
            onHoveredPointChange={(point) => onPlotHover(point?.metaData?.group ?? null)}
            groupPointsAnchor="group"
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
