"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";
import type { GroupInfo } from "./colors";

export type PlotLegendProps = {
  groups: GroupInfo[];
  /** Group values currently hidden from the plot. */
  hidden: Set<string>;
  onToggle: (value: string) => void;
};

/**
 * Clickable legend - ScatterPlot has no categorical legend of its own, so groups
 * are toggled here and filtered out of pointData before it reaches the plot.
 */
const PlotLegend = ({ groups, hidden, onToggle }: PlotLegendProps) => (
  <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ maxHeight: 72, overflowY: "auto" }}>
    {groups.map(({ value, color, count }) => {
      const off = hidden.has(value);
      return (
        <Chip
          key={value}
          size="small"
          onClick={() => onToggle(value)}
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
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {count}
              </Typography>
            </Stack>
          }
          sx={{ bgcolor: off ? "transparent" : "action.hover", cursor: "pointer" }}
        />
      );
    })}
  </Stack>
);

export default PlotLegend;
