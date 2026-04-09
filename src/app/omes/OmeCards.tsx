"use client";
import { Box, Grow, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useGrowOnScroll } from "@/common/hooks/useGrowOnScroll";
import { OmesDataType, OmesList } from "@/common/types/globalTypes";
import { OME_COLORS } from "@/common/colors";
import { getOmeIconName, getOmeLabel } from "./omeContent";

type OmeCardsCircleProps = {
  onSelect: (ome: OmesDataType) => void;
  selectedOme?: OmesDataType | null;
};

const OmeCardsCircle = ({ onSelect, selectedOme }: OmeCardsCircleProps) => {
  const { visible: omesVisible, refs: omeRefs } = useGrowOnScroll(OmesList.length);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(3, minmax(0, 1fr))",
          sm: "repeat(3, minmax(0, 1fr))",
          md: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        },
        gap: { xs: 1.5, md: 2 },
        width: "100%",
        maxWidth: 760,
        mt: 1,
      }}
    >
      {OmesList.map((ome, index) => {
        const label = getOmeLabel(ome);
        const iconName = getOmeIconName(ome);
        const isSelected = selectedOme === ome;

        return (
          <Grow
            in={omesVisible[index]}
            timeout={500 + index * 120}
            style={{ transformOrigin: "left center" }}
            key={`${ome}-${index}`}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                gap: { xs: 1, md: 0 },
              }}
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
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  justifyContent: { xs: "center", md: "flex-start" },
                  gap: 1.5,
                  height: { xs: 88, md: 70 },
                  width: "100%",
                  maxWidth: { xs: 88, md: "none" },
                  p: { xs: 1, md: 1 },
                  borderRadius: { xs: "50%", md: 1.5 },
                  backgroundColor: isSelected ? "surface.main" : "white",
                  border: isSelected ? "3px solid" : "1px solid",
                  borderColor: isSelected ? "primary.light" : "rgba(12, 64, 60, 0.12)",
                  boxShadow: "0 8px 18px rgba(0, 0, 0, 0.12)",
                  color: "text.primary",
                  textAlign: "left",
                  cursor: "pointer",
                  appearance: "none",
                  transition:
                    "transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 14px 28px rgba(0, 0, 0, 0.18)",
                    backgroundColor: "surface.main",
                  },
                  "&:hover .ome-icon": {
                    transform: "scale(1.08)",
                  },
                  "&:hover + .ome-label, &:hover .ome-label": {
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
                    width: { xs: 60, md: 40 },
                    height: { xs: 60, md: 40 },
                    flexShrink: 0,
                    borderRadius: 99,
                    backgroundImage: `url(/OmeIcons/NoBgrnd/${iconName}.png)`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    transition: "transform 0.25s ease",
                  }}
                />
                {!isMobile && (
                  <Typography
                    className="ome-label"
                    variant="body1"
                    title={label}
                    sx={{
                      minWidth: 0,
                      flex: 1,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      transition: "color 0.25s ease",
                    }}
                  >
                    {label === "WGS"
                      ? "Whole Genome Sequencing"
                      : label === "WGBS"
                        ? "Whole Genome Bisulfite Sequencing"
                        : label}
                  </Typography>
                )}
              </Box>
              {isMobile && (
                <Typography
                  className="ome-label"
                  variant="body2"
                  title={label}
                  sx={{
                    color: "primary.main",
                    maxWidth: 110,
                    minHeight: 34,
                    px: 1,
                    py: 0.6,
                    borderRadius: 99,
                    backgroundColor: "white",
                    border: "1px solid rgba(255,255,255,0.4)",
                    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.16)",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    lineHeight: 1.2,
                    maxHeight: "2.4em",
                    textAlign: "center",
                  }}
                >
                  {label}
                </Typography>
              )}
            </Box>
          </Grow>
        );
      })}
    </Box>
  );
};

export default OmeCardsCircle;
