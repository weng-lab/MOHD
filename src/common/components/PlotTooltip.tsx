import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

export type PlotTooltipRow = {
  label: string;
  value: ReactNode;
};

export type PlotTooltipProps = {
  /** The point's identity - shown bold and unlabeled, above the detail rows. */
  title: ReactNode;
  rows: PlotTooltipRow[];
};

/** Shared tooltip body for every plot (scatter, heatmap, histogram). Styling baseline: WGS PCA. */
const PlotTooltip = ({ title, rows }: PlotTooltipProps) => (
  <Box sx={{ p: 1 }}>
    <Typography variant="body2">
      <strong>{title}</strong>
    </Typography>
    {rows.map((row) => (
      <Typography key={row.label} variant="caption" display="block">
        {row.label}: {row.value}
      </Typography>
    ))}
  </Box>
);

export default PlotTooltip;
