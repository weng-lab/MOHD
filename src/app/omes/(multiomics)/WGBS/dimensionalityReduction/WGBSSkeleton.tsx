import { Skeleton, Stack } from "@mui/material";

/**
 * Stand-in for TwoPaneLayout, shaped like it.
 *
 * Rendered both by loading.tsx (navigation into this segment) and by page.tsx's
 * own <Suspense> (the query behind it), so the placeholder holds its shape
 * across the handover.
 */
const WGBSSkeleton = () => (
  <Stack direction={{ xs: "column", lg: "row" }} gap={2} height="max(60vh, 700px)">
    <Skeleton variant="rounded" sx={{ flex: 1, height: "100%", borderRadius: 2 }} />
    <Skeleton variant="rounded" sx={{ flex: 1, height: "100%", borderRadius: 2 }} />
  </Stack>
);

export default WGBSSkeleton;
