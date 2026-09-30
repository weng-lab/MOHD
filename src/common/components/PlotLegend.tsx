"use client";

import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import type { PointShape } from "@weng-lab/visualization";
import ShapeGlyph from "./ShapeGlyph";

/** One chip: a group of points the plot draws in one color. */
export type LegendGroup = {
  /** The group's identity, which `hidden`, `highlighted` and the callbacks key on. */
  value: string;
  /** What the chip shows. */
  label: string;
  color: string;
  count: number;
  /** The group's point shape, where the plot is shaped by the same field. Otherwise a plain dot. */
  shape?: PointShape;
  /** For a privacy group folding small categories together, the categories, named on hover and never counted. */
  members?: string[];
};

export type PlotLegendProps = {
  groups: LegendGroup[];
  /** Group values currently filtered out; the caller decides what that does to the points (see dimHidden). */
  hidden: ReadonlySet<string>;
  onToggle: (value: string) => void;
  /** Group to ring, whichever side it came from: the plot's cursor or a chip's own hover. */
  highlighted?: string | null;
  /** Fired as the cursor enters and leaves a chip, so the plot can highlight that group. */
  onHover?: (value: string | null) => void;
  /** The field these chips stand for, worth showing where a plot has more than one row of chips. */
  label?: string;
};

/**
 * Clickable legend - ScatterPlot has no categorical legend of its own, so groups are toggled here
 * and the caller decides what a toggle does to its points.
 */
const PlotLegend = ({ groups, hidden, onToggle, highlighted, onHover, label: rowLabel }: PlotLegendProps) => (
  // Natural height (nine groups at most wraps to a few rows); flexShrink: 0 keeps the plot from squeezing it.
  <Stack direction="row" flexWrap="wrap" alignItems="center" gap={0.5} flexShrink={0}>
    {rowLabel && (
      <Typography variant="caption" color="text.secondary" mr={0.25}>
        {rowLabel}
      </Typography>
    )}
    {groups.map(({ value, label, color, count, members, shape }) => {
      const off = hidden.has(value);
      const on = value === highlighted;
      const chip = (
        <Chip
          key={value}
          size="small"
          onClick={() => onToggle(value)}
          onMouseEnter={() => onHover?.(value)}
          onMouseLeave={() => onHover?.(null)}
          variant={off ? "outlined" : "filled"}
          label={
            <Stack direction="row" alignItems="center" gap={0.75}>
              {shape ? (
                <ShapeGlyph shape={shape} color={color} hollow={off} size={13} />
              ) : (
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: off ? "transparent" : color,
                    border: `2px solid ${color}`,
                    flexShrink: 0,
                  }}
                />
              )}
              <Typography variant="caption" sx={{ textDecoration: off ? "line-through" : "none" }}>
                {label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {count}
              </Typography>
            </Stack>
          }
          sx={{
            bgcolor: off ? "transparent" : on ? "action.selected" : "action.hover",
            cursor: "pointer",
            // Outline rather than border, so the ring can't reflow the row.
            outline: on ? `2px solid ${color}` : "none",
            outlineOffset: 1,
          }}
        />
      );

      // A folded group names its categories, without counts. MUI composes the
      // chip's hover handlers with the tooltip's, so the highlight still fires.
      return members?.length ? (
        <Tooltip
          key={value}
          arrow
          title={
            <>
              <Typography variant="caption" component="p">
                Combined to protect participant privacy:
              </Typography>
              <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                {members.map((member) => (
                  <Typography key={member} component="li" variant="caption">
                    {member}
                  </Typography>
                ))}
              </Box>
            </>
          }
        >
          {chip}
        </Tooltip>
      ) : (
        chip
      );
    })}
  </Stack>
);

export default PlotLegend;
