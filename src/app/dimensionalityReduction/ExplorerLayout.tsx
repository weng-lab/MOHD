import { Box } from "@mui/material";
import type { ReactNode } from "react";

/**
 * Layout shared by the explorer and the skeleton standing in for it, so the placeholder holds the
 * shape the controls and plot land in.
 */

const PANEL_WIDTH = 300;

/** Height under the app header, less the page's own padding (p={2}, top and bottom). */
export const VIEWPORT_HEIGHT = "calc(100vh - var(--header-height, 64px) - 32px)";

/**
 * From md up both columns fit the viewport, so the plot never scrolls out from beside the controls
 * that drive it. The panel scrolls within itself instead, if its filters outgrow a short window.
 */
export const PANEL_SX = {
  maxHeight: { md: VIEWPORT_HEIGHT },
  overflowY: { md: "auto" },
} as const;

/** The floor keeps the plot usable on short screens, where scrolling the page is the better trade. */
export const CARD_SX = {
  height: { xs: 560, md: `max(${VIEWPORT_HEIGHT}, 600px)` },
} as const;

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
