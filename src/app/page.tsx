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
        paddingX={{xs: 2, md: 0}}
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
          background: (theme) =>
            `linear-gradient(
              to bottom,
              ${theme.palette.primary.dark},
              ${theme.palette.primary.main}
            )`,
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
              { value: "13", label: "Sites", link: "/about" },
              { value: "1.8K", label: "Participants", link: "/about" },
              { value: "8", label: "Omes", link: "/omes" },
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
