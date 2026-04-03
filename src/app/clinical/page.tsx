import { Box } from "@mui/material";

export default function ClinicalDataLanding() {
  return (
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
    </Box>
  );
}
