import { useEffect, useState } from "react";
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
  Fade,
  Alert,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import type { TreeViewDefaultItemModelProperties } from "@mui/x-tree-view/models";
import {
  BulkDownloadFormat,
  useBulkDownloadJob,
} from "@/common/hooks/useBulkDownloadJob";
import { formatBytes } from "@/common/downloads";

export type BulkDownloadModalProps = {
  open: boolean;
  onClose: () => void;
  filePaths: string[];
  totalSize: number;
  filterSummary?: string | null;
  ome?: string;
  fileTreeItems?: TreeViewDefaultItemModelProperties[];
};

const FORMAT_LABELS: Record<BulkDownloadFormat, string> = {
  zip: "ZIP",
  tarball: "Tarball (.tar.gz)",
  script: "Shell Script (.sh)",
};

const BulkDownloadModal = ({
  open,
  onClose,
  filePaths,
  totalSize,
  filterSummary,
  ome,
  fileTreeItems,
}: BulkDownloadModalProps) => {
  const [format, setFormat] = useState<BulkDownloadFormat>("zip");
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
  }, [open, reset]);

  const handleSubmit = () => {
    submit(filePaths, format, ome);
  };

  const isSubmitting = status === "submitting";

  return (
    <Modal open={open} onClose={onClose}>
      <Fade in={open}>
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
            width: 420,
            outline: "none",
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={0.5}>
            Bulk Download
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Downloads open-access files only. AnVIL-restricted files are not
            included. Pick your format: .zip or tar.gz for a direct archive
            download, or shell script to pull the files yourself.
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {filterSummary && (
            <Typography
              variant="body2"
              color="text.secondary"
              mb={1}
              sx={{ fontStyle: "italic" }}
            >
              Filtered by: {filterSummary}
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary" mb={2}>
            {filePaths.length} file{filePaths.length !== 1 ? "s" : ""} &middot;{" "}
            {formatBytes(totalSize)}
          </Typography>

          {fileTreeItems && fileTreeItems.length > 0 && (
            <Box
              sx={{
                maxHeight: 350,
                overflowY: "auto",
                mb: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <RichTreeView items={fileTreeItems} />
            </Box>
          )}

          <Stack spacing={2}>
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={500}>
                Format
              </Typography>
              <ToggleButtonGroup
                value={format}
                exclusive
                onChange={(_, val) => {
                  if (val) setFormat(val);
                }}
                size="small"
                fullWidth
              >
                {(Object.keys(FORMAT_LABELS) as BulkDownloadFormat[]).map(
                  (f) => (
                    <ToggleButton
                      key={f}
                      value={f}
                      sx={{ textTransform: "none", flex: 1 }}
                    >
                      {FORMAT_LABELS[f]}
                    </ToggleButton>
                  ),
                )}
              </ToggleButtonGroup>
            </Stack>

            {status === "failed" && (
              <Alert severity="error" sx={{ py: 0.5 }}>
                Couldn&apos;t start download. Check your connection and try
                again.
              </Alert>
            )}

            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <DownloadIcon />
                  )
                }
                onClick={handleSubmit}
                disabled={filePaths.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Submitting\u2026" : "Start Download"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default BulkDownloadModal;
