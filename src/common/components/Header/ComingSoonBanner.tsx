"use client";
import { Box, Typography } from "@mui/material";

const ComingSoonBanner = () => {

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: 35,
        maxHeight: 35,
        px: 5,
        bgcolor: "secondary.main",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          minWidth: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <Box
          sx={{
            height: 20,
            px: 1,
            borderRadius: 999,
            bgcolor: "secondary.light",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption">Coming Soon</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis" }}>
          <b>MOHD Data Portal:</b> Exploring omics data from 10,000 samples across 1,800 participants.
        </Typography>
      </Box>
    </Box>
  );
};

export default ComingSoonBanner;
