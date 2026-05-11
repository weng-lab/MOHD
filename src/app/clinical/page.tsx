import { Box, Divider, Stack, Typography } from "@mui/material";
import DataExplorer from "./DataExplorer";

export default function ClinicalDataLanding() {
  return (
    <Box width="100%">
      <Box
        width="100%"
        sx={{
          position: "relative",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 7fr) minmax(0, 5fr)" },
          alignItems: "stretch",
          minHeight: { xs: "100dvh", md: "70vh" },
          backgroundImage: "url('/Backgrounds/clinical-landing-bg@4x.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: { xs: "center top", md: "top right" },
          backgroundSize: { xs: "cover", md: "contain" },
          backgroundColor: "primary.main",
        }}
        color="white"
      >
        <Stack
          spacing={5}
          sx={{
            position: "relative",
            zIndex: 2,
            justifyContent: { xs: "flex-start", md: "center" },
            px: { xs: 3, sm: 4, md: 8, lg: 10 },
            py: 5,
            minHeight: { xs: "100dvh", md: "auto" },
          }}
        >
          <Typography
            variant="h4"
            fontWeight={600}
          >
            Phenotypic and Contextual Data
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              maxWidth: 760,
            }}
          >
            <Divider
              sx={{
                flex: 1,
                borderColor: "rgba(255,255,255,0.22)",
              }}
            />
          </Box>
        </Stack>
      </Box>
      <DataExplorer />
    </Box>
  );
}

