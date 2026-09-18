"use client";

import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import type { PointShape } from "@weng-lab/visualization";
import ShapeGlyph from "./ShapeGlyph";

/** One chip: a group of points the plot draws in one color. */
export type LegendGroup = {
  /**
   * The group's identity. `hidden`, `highlighted` and both callbacks key on this, never on
   * `label`.
   */
  value: string;
  /** What the chip shows. */
  label: string;
  color: string;
  count: number;
  /**
   * The shape the plot draws this group as, where it is also shaped by the field it is colored by.
   * Undefined on a plot that encodes nothing in shape, whose chips keep their plain dot.
   */
  shape?: PointShape;
  /**
   * For a group that folds small categories together to protect participant privacy, the
   * categories folded in - named on hover, never counted. Undefined on every other group.
   */
  members?: string[];
};

export type PlotLegendProps = {
  groups: LegendGroup[];
  /**
   * Group values currently filtered out. What that does to the points is the caller's to decide:
   * an embedding fades them into the background rather than dropping them, since a point's place
   * only means anything beside the rest - see dimHidden in plotDimming.
   */
  hidden: ReadonlySet<string>;
  onToggle: (value: string) => void;
  /** Group to ring, whichever side it came from: the plot's cursor or a chip's own hover. */
  highlighted?: string | null;
  /** Fired as the cursor enters and leaves a chip, so the plot can highlight that group. */
  onHover?: (value: string | null) => void;
  /**
   * The field these chips stand for. Worth showing only where a plot carries more than one of
   * these rows, since two rows of identical chips otherwise leave the reader to work out which
   * encoding each one explains.
   */
  label?: string;
};

/**
 * Clickable legend - ScatterPlot has no categorical legend of its own, so groups are toggled here
 * and the caller decides what a toggle does to its points.
 */
const PlotLegend = ({ groups, hidden, onToggle, highlighted, onHover, label: rowLabel }: PlotLegendProps) => (
  // Natural height, no cap: the widest legend in use is nine groups (the age bands), so this wraps
  // to a few rows at most. A maxHeight clipped the last row rather than scrolling visibly, and
  // flexShrink: 0 stops the plot below it from squeezing the rows instead.
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
            // Outline rather than a border: it is drawn outside the box, so the
            // ring appearing under the cursor cannot reflow a wrapped chip row.
            outline: on ? `2px solid ${color}` : "none",
            outlineOffset: 1,
          }}
        />
      );

      // A folded group's chip names what went into it. Which responses the survey
      // offers is worth showing even where a category is too small to plot on
      // its own - without counts, which is the whole point of having folded
      // them. MUI composes the chip's own hover handlers with the tooltip's, so
      // the highlight above still fires, and the tooltip opens on focus too.
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
