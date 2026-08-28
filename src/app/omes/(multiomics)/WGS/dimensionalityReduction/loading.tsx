import { Box, Skeleton } from "@mui/material";

/**
 * Route-level fallback. Shows during navigation into this segment; the inner
 * <Suspense> in page.tsx is what covers the query itself.
 */
const Loading = () => (
  <Box p={3}>
    <Skeleton variant="text" width={320} height={40} />
    <Skeleton variant="rounded" height={400} sx={{ mt: 2 }} />
  </Box>
);

export default Loading;
