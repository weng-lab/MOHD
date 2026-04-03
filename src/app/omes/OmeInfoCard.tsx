"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { OmesDataType } from "@/common/types/globalTypes";
import { OME_COLORS } from "@/common/colors";
import {
  OME_DESCRIPTIONS,
  // getGenomeBrowserHref,
  getOmeIconName,
  getOmeInfoHref,
  getOmeLabel,
} from "./omeContent";

type OmeInfoCardProps = {
  selectedOme: OmesDataType;
  isVisible: boolean;
  onClose: () => void;
};

export default function OmeInfoCard({ selectedOme, isVisible, onClose }: OmeInfoCardProps) {
  const selectedColor = OME_COLORS[selectedOme.toLowerCase()] ?? "#3f7f79";
  // const genomeBrowserHref = getGenomeBrowserHref(selectedOme);

  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: 1000,
        minHeight: 500,
        display: "flex",
        flexDirection: "column",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 320ms ease, transform 320ms ease",
        borderRadius: 3,
        border: "1px solid rgba(255,255,255,0.28)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(242,249,248,0.68) 100%)",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.16)",
        backdropFilter: "blur(16px)",
        color: "text.primary",
        p: 2,
      }}
    >
      <Stack sx={{ flex: 1, justifyContent: "space-between" }}>
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
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
                <Stack>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: "rgba(20, 39, 37, 0.96)",
                    textTransform:
                      selectedOme === "WGS" || selectedOme === "WGBS" ? "uppercase" : "none",
                  }}
                >
                  {getOmeLabel(selectedOme)}
                </Typography>
              </Box>
              {(selectedOme === "WGS" || selectedOme === "WGBS") && (
                <Typography
                  variant="h5"
                >
                  {selectedOme === "WGBS" ? "(Whole Genome Bisulfate Sequencing)" : "(Whole Genome Sequencing)"}
                </Typography>
              )}
            </Stack>
            </Stack>
            <IconButton
              aria-label="Close selected OME"
              onClick={onClose}
              sx={{
                color: "rgba(20, 39, 37, 0.7)",
                mr: -1,
                mt: -1,
              }}
            >
              <CloseIcon />
            </IconButton>
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
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent={"space-between"}>
          <Button
            // component={genomeBrowserHref ? Link : "button"}
            // href={genomeBrowserHref ?? undefined}
            variant="contained"
            // disabled={!genomeBrowserHref}
            sx={{
              minWidth: 170,
              backgroundColor: "secondary.main"
            }}
          >
            Genome Browser
          </Button>
          <Button
            component={Link}
            href={getOmeInfoHref(selectedOme)}
            variant="outlined"
            sx={{
              minWidth: 170,
            }}
          >
            Go to {getOmeLabel(selectedOme)} page
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
