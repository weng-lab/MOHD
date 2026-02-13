"use client";
import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import AtAGlance from "./landing/GlanceMetrics";
import LandingPageCards from "./landing/LandingPageCards";

export default function Home() {
  return (
    <div>
      <Box
        width="100%"
        paddingBottom={10}
        paddingTop={5}
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
          backgroundColor: "primary.main",
        }}
        color={"white"}
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
        <Stack alignItems="center">
          <Typography variant="h4">
            <b>Multiomics for Health and Diseases</b>
          </Typography>
          <Typography variant="h5">
            <b>Data Portal</b>
          </Typography>
        </Stack>
        <Typography variant="body1">
          Explore our extensive omics data 10,000 samples across 1,800 participants.
        </Typography>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translate(-50%, 50%)",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <AtAGlance
            stats={[
              { value: "100+", label: "Lorem ipsum" },
              { value: "8", label: "Omes" },
              { value: "12K", label: "Lorem" },
            ]}
          />
        </Box>
      </Box>
      <Box p={5}>
        <LandingPageCards />
      </Box>
    </div>
  );
}
