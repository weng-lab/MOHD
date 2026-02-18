"use client";
import { Stack, Typography, Box } from "@mui/material";
import OmeCards from "./OmeCards";
import OmeDescriptions from "./OmeDescriptions";

export default function MolecularDataLanding() {
  return (
    <Box width="100%">
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 4, md: 6 },
          py: { xs: 4, md: 5 },
          px: { xs: 3, md: 10 },
          alignItems: "stretch",
          background: (theme) =>
            `linear-gradient(
          to bottom,
          ${theme.palette.primary.dark},
          ${theme.palette.primary.main}
        )`,
        }}
        color="white"
      >
        <Stack
          spacing={3}
          sx={{
            flex: 1,
            minHeight: { xs: "auto", md: 500 },
          }}
        >
          <Typography variant="h4">
            <b>Molecular Data</b>
          </Typography>
          <Box
            component="img"
            src="/placeholder.png"
            alt="placeholder"
            sx={{
              width: "100%",
              height: { xs: 250, md: "auto" }, // control image height on mobile
              objectFit: "cover",
              borderRadius: 2,
            }}
          />
        </Stack>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <OmeCards />
        </Box>
      </Box>
      <OmeDescriptions />
    </Box>
  );
}
