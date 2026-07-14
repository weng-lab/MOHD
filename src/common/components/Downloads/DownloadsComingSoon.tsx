"use client";
import { Box, Stack, Typography } from "@mui/material";
import { Construction } from "@mui/icons-material";

/**
 * Placeholder for ome downloads pages whose open-access data isn't yet in the
 * bulk-download catalog. Rendered in place of the dual-pane browser until the
 * ome's metadata.tsv / files.tsv are onboarded on the backend.
 */
export default function DownloadsComingSoon({ omeName }: { omeName?: string }) {
  const subject = omeName ? `${omeName} downloads` : "Downloads";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 400,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 4,
      }}
    >
      <Stack spacing={1.5} alignItems="center" textAlign="center">
        <Construction sx={{ fontSize: 48, color: "primary.main" }} />
        <Typography variant="h6">Downloads coming soon!</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {`${subject} for this data type aren't available yet. Check back once open-access files have been published.`}
        </Typography>
      </Stack>
    </Box>
  );
}
