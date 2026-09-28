import { Box, Skeleton } from "@mui/material";

/** Stand-in for DataExplorer, shaped like it, shown while useSearchParams bails the tree out to client rendering. */
export default function DataExplorerSkeleton() {
  return (
    <Box sx={{ px: { xs: 3, sm: 4, md: 8, lg: 10 }, py: 4, width: "100%", overflow: "hidden" }}>
      <Skeleton variant="text" width={160} height={40} sx={{ mb: 3 }} />
      <Skeleton variant="rounded" height={120} sx={{ mb: 3, borderRadius: 1 }} />
      <Skeleton variant="rounded" sx={{ height: { xs: 320, sm: 420, md: 600 }, borderRadius: 1 }} />
    </Box>
  );
}
