"use client";
import { Stack, Typography, Box, Divider } from "@mui/material";
import OmeCards from "./OmeCards";

export default function MolecularDataLanding() {
  return (
    <Box width="100%">
      <Box
        width="100%"
        sx={(theme) => ({
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "stretch",
          height: { xs: "auto", md: "80vh" },  
          backgroundColor: theme.palette.primary.main,
        })}
        color="white"
      >
        <Stack
          spacing={3}
          sx={{
            position: "relative",
            zIndex: 2,
            flex: { xs: "1 1 auto", md: "0 0 56%" },
            justifyContent: "center",
            px: { xs: 3, sm: 4, md: 8, lg: 10 },
            py: { xs: 4, md: 6 },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
            }}
          >
            Molecular Data
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              maxWidth: 760,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "rgba(255,255,255,0.72)",
                whiteSpace: "nowrap",
              }}
            >
              Select Data Type
            </Typography>
            <Divider
              sx={{
                flex: 1,
                borderColor: "rgba(255,255,255,0.22)",
              }}
            />
          </Box>
          <OmeCards />
        </Stack>
        <Box
          sx={{
            position: "relative",
            flex: { xs: "0 0 320px", md: "1 1 44%" },
            minHeight: { xs: 280, md: "auto" },
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: { xs: 0, md: 0 },
              right: 0,
              bottom: 0,
              left: { xs: "22%", md: "2%" },
              backgroundImage: "url('/molecularPlaceholder.png')",
              backgroundRepeat: "no-repeat",
              backgroundSize: { xs: "cover", md: "cover" },
              backgroundPosition: { xs: "center right", md: "center left" },
              opacity: 0.18,
              filter: "grayscale(1) brightness(1.95) contrast(0.99)",
              pointerEvents: "none",
              zIndex: 0,
            },
          }}
        />
      </Box>
    </Box>
  );
}
