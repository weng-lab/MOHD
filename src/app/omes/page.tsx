"use client";
import { useEffect, useRef, useState } from "react";
import { Stack, Typography, Box, Divider, useMediaQuery, useTheme } from "@mui/material";
import OmeCards from "./OmeCards";
import { OmesDataType } from "@/common/types/globalTypes";
import OmeInfoCard from "./OmeInfoCard";

const CARD_FADE_DURATION_MS = 320;

const HERO_IMAGE = "url('/Backgrounds/molecular-landing.png')";
/** How strongly the artwork shows where it sits behind the ome buttons or card. */
const DIMMED_OPACITY = 0.2;
/**
 * The narrowest hero, as width over height, that shows the artwork at full strength. Its light beam
 * reaches about 0.75 heights in from the right edge and the cards take the left 7/12; at this shape
 * and wider the beam stayed 50px or more clear of the cards across common window sizes.
 */
const FULL_ART_MIN_ASPECT = "33 / 20";

export default function MolecularDataLanding() {
  const theme = useTheme();
  // Below md there's no column beside the buttons for an ome's card, so the card takes their place.
  const isSingleColumn = useMediaQuery(theme.breakpoints.down("md"));
  // The hero's own shape, not the viewport's: it grows past the screen when its content does.
  const fullArtQuery = `@container (width >= ${theme.breakpoints.values.md}px) and (aspect-ratio >= ${FULL_ART_MIN_ASPECT})`;
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
          // minmax(0, …) so the buttons' auto-fill grid wraps to the page instead of widening it.
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 7fr) minmax(0, 5fr)" },
          alignItems: "stretch",
          // Runs down to the footer, which shares the green, so the page has no white band above it.
          minHeight: { xs: "100dvh", md: "calc(100dvh - var(--header-height, 64px))" },
          backgroundColor: "primary.main",
        }}
        color="white"
      >
        {/*
          One treatment at every width: the artwork runs the hero's full height, so its lower edge is the
          hero's and the mask can dissolve the forearm there instead of ending it in a hard line. It
          shows at full strength only where it clears the cards, and is dimmed wherever it would sit
          behind them (the phone layout included) or an ome's card is open over it.
        */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            containerType: "size",
            pointerEvents: "none",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundImage: HERO_IMAGE,
              backgroundRepeat: "no-repeat",
              // Phones center on the hand and vial; cover fills the width too on landscape phones, where
              // a centered full-height image would end in a hard edge on the right. Desktop keeps the
              // full height against the right edge, the artwork's plain-green left side running into the
              // hero's. Either way the only edge that could show is the bottom one the mask fades.
              backgroundSize: { xs: "cover", md: "auto 100%" },
              backgroundPosition: { xs: "center top", md: "right top" },
              maskImage: "linear-gradient(to bottom, #000 75%, transparent)",
              opacity: DIMMED_OPACITY,
              // In step with the ome card fading in and out over the artwork.
              transition: `opacity ${CARD_FADE_DURATION_MS}ms ease`,
              [fullArtQuery]: { opacity: selectedOme ? DIMMED_OPACITY : 1 },
            },
          }}
        />
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
          <Typography variant="h4" fontWeight={600}>
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
          {!isSingleColumn || !displayedOme ? (
            <OmeCards onSelect={handleSelectOme} selectedOme={selectedOme} />
          ) : (
            <Box
              sx={{
                width: "100%",
                maxWidth: 760,
              }}
            >
              <OmeInfoCard selectedOme={displayedOme} isVisible={isCardVisible} onClose={() => handleSelectOme(null)} />
            </Box>
          )}
        </Stack>
        {!isSingleColumn && displayedOme ? (
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
            <OmeInfoCard selectedOme={displayedOme} isVisible={isCardVisible} onClose={() => handleSelectOme(null)} />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
