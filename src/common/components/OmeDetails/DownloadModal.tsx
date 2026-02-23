import React from "react";
import { Modal, Box, IconButton, Stack, Typography, Divider, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { DownloadPlotHandle } from "@weng-lab/visualization";

export type DownloadModalProps = {
  open: boolean;
  onClose: () => void;
  plotRef?: React.RefObject<DownloadPlotHandle | null>;
  plotTitle: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ open, onClose, plotRef, plotTitle }) => {
  const handleDownload = (type: "PNG" | "SVG") => {
    if (!plotRef?.current) return;

    if (type === "PNG") {
      plotRef.current.downloadPNG();
    }

    if (type === "SVG") {
      plotRef.current.downloadSVG();
    }
  };

  const downloadOptions = [
    { label: "PNG", type: "PNG" as const },
    { label: "SVG", type: "SVG" as const },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
          width: 360,
        }}
      >
        <Typography variant="h6" fontWeight={600} mb={1}>
          Download {plotTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Choose a file format to export your plot.
        </Typography>
        <Stack spacing={1.5} divider={<Divider flexItem />}>
          {downloadOptions.map((option) => (
            <Stack key={option.label} direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body1">{option.label}</Typography>
              <IconButton color="primary" onClick={() => handleDownload(option.type)} aria-label={`Download ${option.label}`}>
                <DownloadIcon />
              </IconButton>
            </Stack>
          ))}
        </Stack>
        <Box mt={3} textAlign="right">
          <Button onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DownloadModal;
