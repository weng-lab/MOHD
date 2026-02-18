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
          gap: 6,
          py: 5,
          px: 10,
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
            minHeight: 500,
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
              flex: 1,
              width: "100%",
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
