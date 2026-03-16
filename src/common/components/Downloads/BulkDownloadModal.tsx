import React from "react";
import { Modal, Box, IconButton, Stack, Typography, Divider, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";
import { formatBytes } from "@/common/downloads";

export type DownloadModalProps = {
  open: boolean;
  onClose: () => void;
  ome: string;
  allDatasetsCompressedFile?: DownloadFile;
  filteredDatasetCompressedFile?: DownloadFile;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ open, onClose, ome, allDatasetsCompressedFile, filteredDatasetCompressedFile }) => {

  const constuctUrl = (file: DownloadFile | undefined) => {
    if (!file) return "#";
    const index = ome === "ATAC-seq" ? 2 : ome === "RNA-seq" ? 3 : 1;
    const url = `https://downloads.mohdconsortium.org/${index}_${ome.replace("-seq", "")}/${file.filename}`
    return url;
  }

  const downloadOptions = [
    { label: "Filtered table open access files", url: constuctUrl(filteredDatasetCompressedFile), size: filteredDatasetCompressedFile ? filteredDatasetCompressedFile.size : undefined },
    { label: "All open access files", url: constuctUrl(allDatasetsCompressedFile), size: allDatasetsCompressedFile ? allDatasetsCompressedFile.size : undefined },
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
              <Stack>
                <Typography variant="body1">{option.label}</Typography>
                {option.size && (
                  <Typography variant="body2" color="text.secondary">
                    {formatBytes(option.size)}
                  </Typography>
                )}
              </Stack>
              <IconButton 
                color="primary" 
                aria-label={`Download ${option.label}`} 
                href={option.url} 
                download 
                component={"a"}
                disabled={option.url === "#"}
              >
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