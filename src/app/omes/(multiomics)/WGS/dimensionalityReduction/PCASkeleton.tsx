"use client";

import { Box, Skeleton, Stack } from "@mui/material";
import { ResizablePanes } from "@weng-lab/ui-components";
import { AXIS_CLUSTER_SIZE, PANES } from "./dimensions";

/**
 * Stand-in for the real layout, shaped like it.
 *
 * This page has two loading boundaries, and a visitor can meet both in a row:
 * loading.tsx covers navigation into the segment, then page.tsx's <Suspense>
 * covers the query behind it. Rendering the same skeleton in both means the
 * placeholder holds its shape across the handover, and the plots land in the
 * space their skeleton was already occupying.
 *
 * A client component for the panes, which the library doesn't mark as one.
 */
const PCASkeleton = () => (
  <Stack gap={2}>
    <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr auto 1fr" }} alignItems="center" gap={1}>
      <Skeleton variant="text" width={170} height={32} />
      <Skeleton
        variant="rounded"
        width={AXIS_CLUSTER_SIZE.width}
        height={AXIS_CLUSTER_SIZE.height}
        // The cluster sits in the middle column, over the gutter between the
        // cards, exactly as it does once the controls render.
        sx={{ justifySelf: { sm: "center" }, borderRadius: 2 }}
      />
    </Box>
    <ResizablePanes
      {...PANES}
      first={<Skeleton variant="rounded" height="100%" sx={{ borderRadius: 2 }} />}
      second={<Skeleton variant="rounded" height="100%" sx={{ borderRadius: 2 }} />}
    />
  </Stack>
);

export default PCASkeleton;
