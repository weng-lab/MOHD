"use client";
import { useMemo, useState } from "react";
import { Stack, Typography, Box, Divider, Button } from "@mui/material";
import Link from "next/link";
import OmeCards from "./OmeCards";
import { OmesDataType, OmesList } from "@/common/types/globalTypes";
import { OME_COLORS } from "@/common/colors";
import {
  OME_DESCRIPTIONS,
  getGenomeBrowserHref,
  getOmeIconName,
  getOmeInfoHref,
  getOmeLabel,
} from "./omeContent";

export default function MolecularDataLanding() {
  const [selectedOme, setSelectedOme] = useState<OmesDataType>(OmesList[0]);
  const selectedColor = OME_COLORS[selectedOme.toLowerCase()] ?? "#3f7f79";
  const genomeBrowserHref = useMemo(() => getGenomeBrowserHref(selectedOme), [selectedOme]);

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
          <OmeCards onSelect={setSelectedOme} />
        </Stack>
        <Box
          sx={{
            position: "relative",
            flex: { xs: "0 0 320px", md: "1 1 44%" },
            minHeight: { xs: 280, md: "auto" },
            overflow: "hidden",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            px: { xs: 2.5, sm: 4, md: 4 },
            py: { xs: 2.5, md: 4 },
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
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: 520,
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(242,249,248,0.9) 100%)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.18)",
              backdropFilter: "blur(10px)",
              color: "text.primary",
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    flexShrink: 0,
                    borderRadius: "18px",
                    backgroundColor: `${selectedColor}18`,
                    border: `1px solid ${selectedColor}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      backgroundImage: `url(/OmeIcons/NoBgrnd/${getOmeIconName(selectedOme)}.png)`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ color: selectedColor, letterSpacing: "0.12em", fontWeight: 700 }}
                  >
                    OME Description
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "rgba(20, 39, 37, 0.96)",
                      textTransform:
                        selectedOme === "WGS" || selectedOme === "WGBS" ? "uppercase" : "none",
                    }}
                  >
                    {getOmeLabel(selectedOme)}
                  </Typography>
                </Box>
              </Stack>

              <Typography
                variant="body1"
                sx={{
                  color: "rgba(33, 53, 51, 0.86)",
                  lineHeight: 1.75,
                  minHeight: { md: 168 },
                }}
              >
                {OME_DESCRIPTIONS[selectedOme] ?? "Description coming soon."}
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  component={Link}
                  href={getOmeInfoHref(selectedOme)}
                  variant="contained"
                  sx={{
                    minWidth: 170,
                    backgroundColor: selectedColor,
                    "&:hover": {
                      backgroundColor: selectedColor,
                      filter: "brightness(0.94)",
                    },
                  }}
                >
                  OME Info
                </Button>
                <Button
                  component={genomeBrowserHref ? Link : "button"}
                  href={genomeBrowserHref ?? undefined}
                  variant="outlined"
                  disabled={!genomeBrowserHref}
                  sx={{
                    minWidth: 170,
                    borderColor: `${selectedColor}66`,
                    color: selectedColor,
                  }}
                >
                  Genome Browser
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
