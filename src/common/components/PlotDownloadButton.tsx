"use client";
import { useState } from "react";
import { Button, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

type Props = {
  onDownloadPNG: () => void | Promise<void>;
  onDownloadSVG: () => void | Promise<void>;
};

/**
 * Download button for the plot box: top-right and full-size on larger screens, shrunk down to
 * the bottom-left on mobile so it doesn't overlap the plot heading above.
 */
export default function PlotDownloadButton({ onDownloadPNG, onDownloadSVG }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <Button
        size={isMobile ? "small" : "medium"}
        variant="outlined"
        endIcon={<DownloadIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          position: "absolute",
          zIndex: 1,
          bottom: 8,
          left: 8,
        }}
      >
        Download
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} disableScrollLock>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onDownloadPNG();
          }}
        >
          Download PNG
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onDownloadSVG();
          }}
        >
          Download SVG
        </MenuItem>
      </Menu>
    </>
  );
}
