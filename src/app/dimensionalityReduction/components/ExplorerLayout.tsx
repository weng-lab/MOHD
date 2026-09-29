import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { PANEL_WIDTH } from "./dimensions";

/** Layout shared by the explorer and its skeleton: the control panel beside the plot. */
const ExplorerLayout = ({ panel, plot }: { panel: ReactNode; plot: ReactNode }) => (
  <Box
    display="grid"
    gridTemplateColumns={{ xs: "minmax(0, 1fr)", md: `${PANEL_WIDTH}px minmax(0, 1fr)` }}
    alignItems="start"
    gap={2}
    p={2}
  >
    {panel}
    {plot}
  </Box>
);

export default ExplorerLayout;
