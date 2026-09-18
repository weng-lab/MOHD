"use client";
import { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

type Props = {
  onDownloadPNG: () => void | Promise<void>;
  onDownloadSVG: () => void | Promise<void>;
};

/** Download button for the top-right corner of a plot box, offering PNG/SVG export. */
export default function PlotDownloadButton({ onDownloadPNG, onDownloadSVG }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <Button
        size="medium"
        variant="outlined"
        endIcon={<DownloadIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
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
