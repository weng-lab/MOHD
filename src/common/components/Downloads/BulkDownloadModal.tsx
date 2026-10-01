import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Fade,
  FormControlLabel,
  IconButton,
  Link,
  Modal,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { BulkDownloadDatasetItem } from "@/common/hooks/useOmeDownloadsState";
import SelectedFilesReview from "@/common/components/Downloads/SelectedFilesReview";
import { BulkDownloadFormat, useBulkDownloadJob } from "@/common/hooks/useBulkDownloadJob";
import { ARCHIVE_SIZE_LIMIT_BYTES, formatBytes } from "@/common/downloads";
import { Start } from "@mui/icons-material";

export type BulkDownloadModalProps = {
  open: boolean;
  onClose: () => void;
  /** The paths a job would be submitted with; the tree below lists these same files. */
  filePaths: string[];
  totalSize: number;
  ome?: string;
  bulkDownloadItems: BulkDownloadDatasetItem[];
  /** Removals write straight back to the table selection — the modal owns no copy. */
  onRemoveFile: (sampleId: string, filename: string) => void;
  onRemoveDataset: (sampleId: string) => void;
};

const FORMAT_LABELS: Record<BulkDownloadFormat, string> = {
  zip: "ZIP (.zip)",
  tarball: "Tarball (.tar.gz)",
  script: "Shell Script (.sh)",
  aria2: "aria2 Manifest",
};

/**
 * Formats the service builds by listing URLs for the client to fetch itself,
 * rather than by reading every source byte into an archive. They cost nothing
 * to build, so CreateJob exempts them from MAX_JOB_SIZE — this mirrors that
 * exemption so the UI never steers someone into a job that would 413, and
 * never disables one that would have worked.
 */
const DIRECT_FORMATS: BulkDownloadFormat[] = ["script", "aria2"];

const CODE_SX = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: "0.9em",
  bgcolor: "action.hover",
  borderRadius: 0.5,
  px: 0.5,
} as const;

const isDirectFormat = (format: BulkDownloadFormat) => DIRECT_FORMATS.includes(format);

const BulkDownloadModal = ({
  open,
  onClose,
  filePaths,
  totalSize,
  ome,
  bulkDownloadItems,
  onRemoveFile,
  onRemoveDataset,
}: BulkDownloadModalProps) => {
  const [format, setFormat] = useState<BulkDownloadFormat>("zip");
  const { submit, status, reset } = useBulkDownloadJob();

  const isSubmitting = status === "submitting";

  const fileCount = filePaths.length;
  const datasetCount = bulkDownloadItems.length;

  // The service rejects archive jobs over the limit with a 413, so steer the
  // user to the shell script instead of letting them submit a doomed job.
  const isOverArchiveLimit = totalSize > ARCHIVE_SIZE_LIMIT_BYTES;

  // Forced rather than stored, so removing files back under the limit restores
  // whatever the user had picked. Over the limit every direct-fetch format is
  // still valid, so someone who chose aria2 keeps it instead of being snapped
  // onto the script.
  const effectiveFormat = isOverArchiveLimit && !isDirectFormat(format) ? "script" : format;

  // Every dismissal path lands here — Cancel, the X, Esc and the backdrop — so
  // this is where a stale "failed" alert gets cleared before the next open.
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (await submit(filePaths, effectiveFormat, ome)) handleClose();
  };

  return (
    // Undefined onClose while submitting blocks Esc and backdrop dismissal, so
    // an in-flight job can't be walked away from and resolve onto a closed modal.
    <Modal open={open} onClose={isSubmitting ? undefined : handleClose}>
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "calc(100vw - 32px)", sm: 600, md: 700 },
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "min(800px, calc(100vh - 48px))",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 3,
            outline: "none",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack spacing={1} p={2}>
            <Stack direction="row" justifyContent="space-between" alignItems={"flex-end"}>
              <Typography variant="h5">Bulk Download</Typography>
              <IconButton aria-label="Close" onClick={handleClose} disabled={isSubmitting} sx={{ mt: -0.5, mr: -0.5 }}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Please review your selected files before submitting them for processing.
            </Typography>
            <Alert
              severity="info"
              sx={{
                borderRadius: 2,
                "& .MuiAlert-message": {
                  width: "100%",
                },
              }}
            >
              Restricted AnVIL-only files are not downloadable here.
            </Alert>
          </Stack>
          <Divider />
          <Box
            sx={{
              p: 2,
              bgcolor: "surface.light",
            }}
          >
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography>
                {datasetCount} dataset{datasetCount !== 1 ? "s" : ""} • {fileCount} file{fileCount !== 1 ? "s" : ""}
              </Typography>
              <Typography>{formatBytes(totalSize)}</Typography>
            </Stack>
          </Box>
          <Divider />
          <Box
            sx={{
              overflowY: "auto",
              flex: 1,
            }}
          >
            <SelectedFilesReview
              items={bulkDownloadItems}
              onRemoveFile={onRemoveFile}
              onRemoveDataset={onRemoveDataset}
            />
          </Box>
          <Divider />
          <Stack spacing={1} sx={{ p: 2 }}>
            <Typography>Select format</Typography>
            <Typography variant="caption" color="text.secondary">
              .zip or .tar.gz for a direct archive download, or shell script to pull the files yourself
            </Typography>
            {isOverArchiveLimit && (
              <Alert severity="warning">
                This selection is {formatBytes(totalSize)}, over the {formatBytes(ARCHIVE_SIZE_LIMIT_BYTES)} limit for
                .zip and .tar.gz archives. Download with the shell script or aria2, or remove files to get under the
                limit.
              </Alert>
            )}
            <RadioGroup
              row
              value={effectiveFormat}
              onChange={(event) => setFormat(event.target.value as BulkDownloadFormat)}
              sx={{ gap: { xs: 1, sm: 2.5 }, flexWrap: "wrap" }}
            >
              {(Object.keys(FORMAT_LABELS) as BulkDownloadFormat[]).map((key) => (
                <FormControlLabel
                  key={key}
                  value={key}
                  control={<Radio />}
                  label={FORMAT_LABELS[key]}
                  disabled={isOverArchiveLimit && !isDirectFormat(key)}
                  sx={{ mr: 0 }}
                />
              ))}
            </RadioGroup>
            {/*
              Shown against the selection rather than after the job finishes:
              aria2 is the one option that needs something installed, so the
              decision it informs is this one. The others need no explaining.
            */}
            {effectiveFormat === "aria2" && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "surface.light",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="caption" color="text.secondary" component="div">
                  <strong>aria2</strong> is a download manager you install separately. The shell script already
                  downloads files in parallel and resumes where it left off; what aria2 adds is several connections per
                  file, which can increase speed and help on long-distance or unreliable networks.
                  <Box component="span" sx={{ display: "block", mt: 0.75 }}>
                    Most package managers carry it:{" "}
                    <Box component="code" sx={CODE_SX}>
                      apt install aria2
                    </Box>
                    ,{" "}
                    <Box component="code" sx={CODE_SX}>
                      brew install aria2
                    </Box>
                    ,{" "}
                    <Box component="code" sx={CODE_SX}>
                      dnf install aria2
                    </Box>
                    , or{" "}
                    <Box component="code" sx={CODE_SX}>
                      conda install -c conda-forge aria2
                    </Box>
                    . Windows builds, macOS options and full instructions are at{" "}
                    <Link href="https://aria2.github.io/" target="_blank" rel="noopener noreferrer">
                      aria2.github.io
                    </Link>
                    .
                  </Box>
                </Typography>
              </Box>
            )}
            {status === "failed" && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Couldn&apos;t start download. Check your connection and try again.
              </Alert>
            )}
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button onClick={handleClose} disabled={isSubmitting} variant="outlined">
                Cancel
              </Button>
              <Button
                variant="contained"
                endIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Start />}
                onClick={handleSubmit}
                disabled={fileCount === 0 || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Download"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default BulkDownloadModal;
