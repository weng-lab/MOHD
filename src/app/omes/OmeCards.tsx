"use client";
import { Box, Grow, Typography } from "@mui/material";
import { useGrowOnScroll } from "@/common/hooks/useGrowOnScroll";
import { OmesDataType, OmesList } from "@/common/types/globalTypes";
import { OME_COLORS } from "@/common/colors";
import { getOmeIconName, getOmeLabel } from "./omeContent";

type OmeCardsCircleProps = {
  onSelect: (ome: OmesDataType) => void;
};

const OmeCardsCircle = ({ onSelect }: OmeCardsCircleProps) => {
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
        const label = getOmeLabel(ome);
        const iconName = getOmeIconName(ome);

        return (
          <Grow
            in={omesVisible[index]}
            timeout={500 + index * 120}
            style={{ transformOrigin: "left center" }}
            key={`${ome}-${index}`}
          >
            <Box
              component="button"
              type="button"
              ref={(el: HTMLButtonElement | null) => {
                omeRefs.current[index] = el;
              }}
              data-index={index}
              onClick={() => onSelect(ome)}
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
                color: "text.primary",
                textAlign: "left",
                cursor: "pointer",
                appearance: "none",
                width: "100%",
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
                "&:focus-visible": {
                  outline: "2px solid rgba(255,255,255,0.8)",
                  outlineOffset: 3,
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
