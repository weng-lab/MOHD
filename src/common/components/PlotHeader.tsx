import { Stack, Typography, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

/** The strip's look, for a header laid out its own way - see ExplorerPlot. */
export const PLOT_HEADER_SX = {
  bgcolor: "surface.light",
  borderBottom: 1,
  borderColor: "divider",
  flexShrink: 0,
} as const;

/** For a select in the strip: white against the shading, and capped at its width so a long value truncates on a phone. */
export const HEADER_SELECT_SX = { minWidth: 130, maxWidth: "100%", bgcolor: "background.paper" } as const;

export type PlotHeaderProps = {
  /** What the plot shows, on the left - see PlotHeaderTitle. */
  title: ReactNode;
  /** What changes it - color and shape, axes, scale - on the right, wrapping beneath the title on a narrow frame. */
  controls?: ReactNode;
  sx?: SxProps<Theme>;
};

/** The shaded strip across the top of a plot's frame, one look for every plot in the app. */
const PlotHeader = ({ title, controls, sx }: PlotHeaderProps) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    flexWrap="wrap"
    columnGap={1.5}
    rowGap={1}
    sx={[{ px: 1.5, py: 0.75, ...PLOT_HEADER_SX }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {title}
    {controls && (
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} maxWidth="100%">
        {controls}
      </Stack>
    )}
  </Stack>
);

/**
 * "MOHD (915)": a plot's name and how many samples it draws, or "(412 / 915)" while some are filtered
 * out. Nothing filtered is the common case, and "(915 / 915)" would only make the reader check two
 * numbers to learn that.
 */
export const PlotHeaderTitle = ({ title, shown, total }: { title: string; shown: number; total: number }) => {
  // Fixed locale: this can render on the server, where another locale would fail hydration.
  const count =
    shown === total
      ? shown.toLocaleString("en-US")
      : `${shown.toLocaleString("en-US")} / ${total.toLocaleString("en-US")}`;
  return (
    <Typography variant="subtitle2" noWrap>
      {title}{" "}
      <Typography component="span" variant="body2" color="text.secondary">
        ({count})
      </Typography>
    </Typography>
  );
};

export default PlotHeader;
