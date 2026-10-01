import { Skeleton } from "@mui/material";
import ExplorerLayout from "./ExplorerLayout";
import { CARD_SX, PANEL_SX, VIEWPORT_HEIGHT } from "./dimensions";

/** A stand-in shaped like the explorer, for loading.tsx and page.tsx's Suspense alike. */
const ExplorerSkeleton = () => (
  <ExplorerLayout
    panel={
      <Skeleton variant="rounded" sx={{ ...PANEL_SX, height: { xs: 520, md: VIEWPORT_HEIGHT }, borderRadius: 2 }} />
    }
    plot={<Skeleton variant="rounded" sx={{ ...CARD_SX, borderRadius: 2 }} />}
  />
);

export default ExplorerSkeleton;
