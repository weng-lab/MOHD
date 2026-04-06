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
          paddingBottom={{ xs: 6, md: 8 }}
          paddingTop={{ xs: 4, md: 5 }}
          paddingX={{ xs: 2, md: 0 }}
          maxHeight={500}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 2,
            backgroundImage: "url('/Backgrounds/hero.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
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
              height={150}
              width={150}
              priority
              id="header-helix"
            />
          </Box>
          <Stack alignItems="center" flexWrap={"wrap"} textAlign={"center"}>
            <Typography variant="h4" fontWeight={500}>
              Multiomics for Health and Diseases
            </Typography>
            <Typography variant="h6" fontWeight={400}>
              DATA PORTAL
            </Typography>
          </Stack>
          <Typography variant="body1" textAlign={"center"} color="rgba(255,255,255,0.60)">
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
