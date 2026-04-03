"use client";
import { useEffect, useRef, useState } from "react";
import { Stack, Typography, Box, Divider, useMediaQuery, useTheme } from "@mui/material";
import OmeCards from "./OmeCards";
import { OmesDataType } from "@/common/types/globalTypes";
import OmeInfoCard from "./OmeInfoCard";

const CARD_FADE_DURATION_MS = 320;

export default function MolecularDataLanding() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedOme, setSelectedOme] = useState<OmesDataType | null>(null);
  const [displayedOme, setDisplayedOme] = useState<OmesDataType | null>(null);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFadeTimer = () => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  };

  const handleSelectOme = (ome: OmesDataType | null) => {
    clearFadeTimer();
    setSelectedOme(ome);

    if (!ome) {
      setIsCardVisible(false);
      fadeTimerRef.current = setTimeout(() => {
        setDisplayedOme(null);
      }, CARD_FADE_DURATION_MS);
      return;
    }

    if (!displayedOme) {
      setDisplayedOme(ome);
      fadeTimerRef.current = setTimeout(() => {
        setIsCardVisible(true);
      }, 20);
      return;
    }

    if (ome === displayedOme) {
      setIsCardVisible(true);
      return;
    }

    setIsCardVisible(false);
    fadeTimerRef.current = setTimeout(() => {
      setDisplayedOme(ome);
      setIsCardVisible(true);
    }, CARD_FADE_DURATION_MS);
  };

  useEffect(() => {
    return () => {
      clearFadeTimer();
    };
  }, []);

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
          backgroundImage: "url('/Backgrounds/molecular-landing.png')",
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
            justifyContent: {xs: "flex-start", md: "center"},
            px: { xs: 3, sm: 4, md: 8, lg: 10 },
            py: 5,
            minHeight: { xs: "100dvh", md: "auto" },
          }}
        >
          <Typography
            variant="h3"
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
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.72)",
                textTransform: "uppercase",
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
          {!isMobile || !displayedOme ? (
            <OmeCards onSelect={handleSelectOme} selectedOme={selectedOme} />
          ) : (
            <Box
              sx={{
                width: "100%",
                maxWidth: 760,
              }}
            >
              <OmeInfoCard
                selectedOme={displayedOme}
                isVisible={isCardVisible}
                onClose={() => handleSelectOme(null)}
              />
            </Box>
          )}
        </Stack>
        {!isMobile && displayedOme ? (
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: { md: 4, lg: 5 },
              py: { md: 4 },
            }}
          >
            <OmeInfoCard
              selectedOme={displayedOme}
              isVisible={isCardVisible}
              onClose={() => handleSelectOme(null)}
            />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
