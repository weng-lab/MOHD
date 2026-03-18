import React, { useEffect } from "react";
import {
  Modal,
  Box,
  Stack,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Divider,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { BulkDownloadFormat, useBulkDownloadJob } from "@/common/hooks/useBulkDownloadJob";
import { formatBytes } from "@/common/downloads";

export type BulkDownloadModalProps = {
  open: boolean;
  onClose: () => void;
  filePaths: string[];
  totalSize: number;
};

const FORMAT_LABELS: Record<BulkDownloadFormat, string> = {
  zip: "ZIP",
  tarball: "Tarball (.tar.gz)",
  script: "Shell Script (.sh)",
};

const BulkDownloadModal: React.FC<BulkDownloadModalProps> = ({
  open,
  onClose,
  filePaths,
  totalSize,
}) => {
  const [format, setFormat] = React.useState<BulkDownloadFormat>("zip");
  const { submit, status, reset } = useBulkDownloadJob();

  // Close modal and reset after job is submitted to tray
  useEffect(() => {
    if (status === "submitted") {
      reset();
      onClose();
    }
  }, [status, onClose, reset]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const handleSubmit = () => {
    submit(filePaths, format);
  };

  const isSubmitting = status === "submitting";

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
          width: 400,
          outline: "none",
        }}
      >
        <Typography variant="h6" fontWeight={600} mb={0.5}>
          Bulk Download
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Downloads open-access files only — AnVIL-restricted files are not included.
          Pick your format: ZIP or Tarball for a direct archive download, or Shell Script to pull the files yourself.
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="body2" color="text.secondary" mb={2}>
          {filePaths.length} file{filePaths.length !== 1 ? "s" : ""} &middot; {formatBytes(totalSize)}
        </Typography>

        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="body2" fontWeight={500}>
              Format
            </Typography>
            <ToggleButtonGroup
              value={format}
              exclusive
              onChange={(_, val) => { if (val) setFormat(val); }}
              size="small"
              fullWidth
            >
              {(Object.keys(FORMAT_LABELS) as BulkDownloadFormat[]).map((f) => (
                <ToggleButton key={f} value={f} sx={{ textTransform: "none", flex: 1 }}>
                  {FORMAT_LABELS[f]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          {status === "failed" && (
            <Typography variant="body2" color="error">
              Failed to submit job. Please try again.
            </Typography>
          )}

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
              onClick={handleSubmit}
              disabled={filePaths.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Submitting…" : "Start Download"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default BulkDownloadModal;
