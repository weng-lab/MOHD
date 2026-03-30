"use client";
import { Box, Grow, Typography } from "@mui/material";
import Link from "next/link";
import { useGrowOnScroll } from "@/common/hooks/useGrowOnScroll";
import { OmesList } from "@/common/types/globalTypes";
import { OME_COLORS } from "@/common/colors";

const OmeCardsCircle = () => {
  const { visible: omesVisible, refs: omeRefs } = useGrowOnScroll(OmesList.length);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
        gap: 2,
        width: "100%",
        maxWidth: 760,
        mt: 1,
      }}
    >
      {OmesList.map((ome, index) => {
        const isSeq = ome === "RNA" || ome === "ATAC";
        const label = isSeq ? `${ome}-seq` : ome.charAt(0).toUpperCase() + ome.slice(1);
        const iconName = ome.toLowerCase().split("-")[0];

        return (
          <Grow
            in={omesVisible[index]}
            timeout={500 + index * 120}
            style={{ transformOrigin: "left center" }}
            key={`${ome}-${index}`}
          >
            <Box
              component={Link}
              href={`/omes/${ome}/dimensionalityReduction`}
              scroll
              ref={(el: HTMLAnchorElement | null) => {
                omeRefs.current[index] = el;
              }}
              data-index={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                minHeight: 72,
                px: { xs: 2, md: 2.25 },
                py: 1.5,
                borderRadius: 1.5,
                backgroundColor: "rgba(240, 250, 250, 0.96)",
                border: "1px solid rgba(12, 64, 60, 0.12)",
                boxShadow: "0 8px 18px rgba(0, 0, 0, 0.12)",
                textDecoration: "none",
                color: "text.primary",
                transition:
                  "transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 14px 28px rgba(0, 0, 0, 0.18)",
                  backgroundColor: "rgba(255,255,255,0.98)",
                },
                "&:hover .ome-icon": {
                  transform: "scale(1.08)",
                },
                "&:hover .ome-label": {
                  color: OME_COLORS[ome.toLowerCase()] ?? "primary.main",
                },
              }}
            >
              <Box
                className="ome-icon"
                sx={{
                  width: 34,
                  height: 34,
                  flexShrink: 0,
                  backgroundImage: `url(/OmeIcons/NoBgrnd/${iconName}.png)`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  transition: "transform 0.25s ease",
                }}
              />
              <Typography
                className="ome-label"
                variant="h6"
                sx={{
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  fontWeight: 500,
                  lineHeight: 1.2,
                  color: "rgba(33, 53, 51, 0.92)",
                  textTransform: ome === "WGS" || ome === "WGBS" ? "uppercase" : "none",
                  transition: "color 0.25s ease",
                }}
              >
                {label}
              </Typography>
            </Box>
          </Grow>
        );
      })}
    </Box>
  );
};

export default OmeCardsCircle;
