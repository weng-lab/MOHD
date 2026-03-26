"use client";
import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import AtAGlance from "./landing/GlanceMetrics";
import LandingPageCards from "./landing/LandingPageCards";

export default function Home() {
  return (
    <Box>
      <Box sx={{ backgroundColor: "primary.light" }}>
        <Box
          width="100%"
          paddingBottom={10}
          paddingTop={5}
          paddingX={{ xs: 2, md: 0 }}
          sx={(theme) => ({
            position: "relative",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 2,
            background: `linear-gradient(
            to bottom,
            ${theme.palette.primary.main},
            ${theme.palette.primary.light}
          )`,
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              top: 0,
              bottom: 0,
              width: { xs: "50%", md: 550 },
              backgroundImage: "url('/molecularBackground.png')",
              backgroundRepeat: "repeat-y",
              backgroundSize: { xs: "260px auto", md: "550px auto" },
              opacity: 0.15,
              filter: "grayscale(1) brightness(1.95) contrast(0.99)",
              pointerEvents: "none",
            },
            "&::before": {
              left: 0,
              backgroundPosition: "left center",
            },
            "&::after": {
              right: 0,
              backgroundPosition: "right center",
            },
            "& > *": {
              position: "relative",
              zIndex: 1,
            },
          })}
          color="white"
        >
          <Box
            sx={{
              backgroundColor: "white",
              p: 2,
              borderRadius: 99,
            }}
          >
            <Image
              src="/logo.png"
              alt="logo"
              height={125}
              width={125}
              priority
              id="header-helix"
            />
          </Box>
          <Stack alignItems="center" flexWrap={"wrap"} textAlign={"center"}>
            <Typography variant="h4">
              <b>Multiomics for Health and Diseases</b>
            </Typography>
            <Typography variant="h5">
              <b>Data Portal</b>
            </Typography>
          </Stack>
          <Typography variant="body1" textAlign={"center"}>
            Explore our extensive omics data 10,000 samples across 1,800 participants.
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: { xs: -5, md: -6 },
          px: 2,
          position: "relative",
          zIndex: 1,
        }}
      >
        <AtAGlance />
      </Box>
      <Box p={2}>
        <LandingPageCards />
      </Box>
    </Box>
  );
}
