import { Stack } from "@mui/material";
import type { ReactNode } from "react";
import PlotHeader, { type PlotHeaderProps } from "./PlotHeader";

/**
 * TwoPaneLayout's FigurePanel pads its figure by this much, in theme spacing. The header reaches out
 * over it to the frame's border, as a card's header does, and the body keeps it.
 */
const FIGURE_PADDING = 1;

type PaneFigureProps = Pick<PlotHeaderProps, "title" | "controls"> & { children: ReactNode };

/**
 * A figure beside a table: the shaded header of the explorer's and WGS's plot cards across the top of
 * TwoPaneLayout's frame, and the figure filling the rest of its height.
 */
const PaneFigure = ({ title, controls, children }: PaneFigureProps) => (
  <Stack height="100%" minHeight={0}>
    <PlotHeader
      title={title}
      controls={controls}
      sx={{ mx: -FIGURE_PADDING, mt: -FIGURE_PADDING, mb: FIGURE_PADDING }}
    />
    <Stack gap={1} flex={1} minHeight={0} minWidth={0}>
      {children}
    </Stack>
  </Stack>
);

export default PaneFigure;
