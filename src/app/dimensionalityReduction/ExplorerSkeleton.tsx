import { Skeleton } from "@mui/material";
import ExplorerLayout, { CARD_SX, PANEL_SX, VIEWPORT_HEIGHT } from "./ExplorerLayout";

/**
 * Stand-in for the explorer, shaped like it.
 *
 * Rendered both by loading.tsx (navigation into this route) and by page.tsx's own <Suspense> (the
 * query behind it), so the placeholder holds its shape across the handover.
 */
const ExplorerSkeleton = () => (
  <ExplorerLayout
    panel={
      <Skeleton variant="rounded" sx={{ ...PANEL_SX, height: { xs: 520, md: VIEWPORT_HEIGHT }, borderRadius: 2 }} />
    }
    plot={<Skeleton variant="rounded" sx={{ ...CARD_SX, borderRadius: 2 }} />}
  />
);

export default ExplorerSkeleton;
