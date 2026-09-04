"use client";

import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import type { GroupInfo } from "./groups";

export type PlotLegendProps = {
  groups: GroupInfo[];
  /** Group values currently hidden from the plot. */
  hidden: ReadonlySet<string>;
  onToggle: (value: string) => void;
  /** Group to ring, whichever side it came from: the plot's cursor or a chip's own hover. */
  highlighted?: string | null;
  /** Fired as the cursor enters and leaves a chip, so the plot can highlight that group. */
  onHover?: (value: string | null) => void;
};

/**
 * Clickable legend - ScatterPlot has no categorical legend of its own, so groups
 * are toggled here and filtered out of pointData before it reaches the plot.
 */
const PlotLegend = ({ groups, hidden, onToggle, highlighted, onHover }: PlotLegendProps) => (
  // Natural height, no cap: the widest option is 9 groups (age bands) and the
  // longest labels are the reported race/ethnicity values, so this wraps to a few
  // rows at most. A maxHeight clipped the last row rather than scrolling visibly,
  // and flexShrink: 0 stops the plot below it from squeezing the rows instead.
  <Stack direction="row" flexWrap="wrap" gap={0.5} flexShrink={0}>
    {groups.map(({ value, label, color, count, members }) => {
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

      // The bin's chip names what went into it. Which responses the survey
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
