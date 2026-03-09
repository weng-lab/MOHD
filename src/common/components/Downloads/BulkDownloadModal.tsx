import React from "react";
import { Modal, Box, IconButton, Stack, Typography, Divider, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

export type DownloadModalProps = {
  open: boolean;
  onClose: () => void;
  ome: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ open, onClose, ome }) => {
  const handleDownload = (type: "PNG" | "SVG") => {
  };

  const downloadOptions = [
    { label: "Filtered table open access files", type: "PNG" as const },
    { label: "All open access files", type: "SVG" as const },
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
          Download {ome} data
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Choose what data to export.
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