import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Fade,
  FormControlLabel,
  IconButton,
  Modal,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RemoveIcon from "@mui/icons-material/Remove";
import type { BulkDownloadDatasetItem } from "@/common/hooks/useOmeDownloadsState";
import {
  BulkDownloadFormat,
  useBulkDownloadJob,
} from "@/common/hooks/useBulkDownloadJob";
import { ARCHIVE_SIZE_LIMIT_BYTES, formatBytes } from "@/common/downloads";
import { Publish, Start } from "@mui/icons-material";

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
};

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
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const { submit, status, reset } = useBulkDownloadJob();

  const isSubmitting = status === "submitting";

  const fileCount = filePaths.length;
  const datasetCount = bulkDownloadItems.length;

  // The service rejects archive jobs over the limit with a 413, so steer the
  // user to the shell script instead of letting them submit a doomed job.
  const isOverArchiveLimit = totalSize > ARCHIVE_SIZE_LIMIT_BYTES;

  // Forced rather than stored, so removing files back under the limit restores
  // whatever the user had picked.
  const effectiveFormat = isOverArchiveLimit ? "script" : format;

  // Every dismissal path lands here — Cancel, the X, Esc and the backdrop — so
  // this is where a stale "failed" alert gets cleared before the next open.
  const handleClose = () => {
    setExpandedIds([]);
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (await submit(filePaths, effectiveFormat, ome)) handleClose();
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((currentId) => currentId !== id)
        : [...current, id],
    );
  };

  const handleRemoveDataset = (dataset: BulkDownloadDatasetItem) => {
    setExpandedIds((current) => current.filter((currentId) => currentId !== dataset.id));
    onRemoveDataset(dataset.sampleId);
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
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems={"flex-end"}
            >
              <Typography variant="h5">
                Bulk Download
              </Typography>
              <IconButton
                aria-label="Close"
                onClick={handleClose}
                disabled={isSubmitting}
                sx={{ mt: -0.5, mr: -0.5 }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Please review your selected files before submitting them for
              processing.
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
                  {datasetCount} dataset{datasetCount !== 1 ? "s" : ""} •{" "}
                  {fileCount} file{fileCount !== 1 ? "s" : ""}
              </Typography>
              <Typography>
                {formatBytes(totalSize)}
              </Typography>
            </Stack>
          </Box>
          <Divider />
          <Box
            sx={{
              overflowY: "auto",
              flex: 1,
            }}
          >
            <Stack>
              {bulkDownloadItems.length === 0 && (
                <Typography variant="body1" color="text.secondary">
                  No files selected. Close this dialog and pick files from the
                  table to start a download.
                </Typography>
              )}
              {bulkDownloadItems.map((dataset, i) => {
                const datasetTitle = dataset.sampleId;

                return (
                  <Box key={dataset.id}>
                    <Accordion
                      expanded={expandedIds.includes(dataset.id)}
                      onChange={() => toggleExpanded(dataset.id)}
                      disableGutters
                      elevation={0}
                      square
                      sx={{
                        overflow: "hidden",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          p: 2,
                          flexDirection: "row-reverse",
                          bgcolor: expandedIds.includes(dataset.id)
                            ? "surface.light"
                            : "transparent",
                          "& .MuiAccordionSummary-content": {
                            my: 0,
                            ml: 1,
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ width: "100%" }}
                        >
                          <Box>
                            <Typography variant="subtitle1">
                              <b>{datasetTitle}</b>
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {dataset.children.length} file
                              {dataset.children.length !== 1 ? "s" : ""}
                            </Typography>
                          </Box>
                          <IconButton
                            component="span"
                            role="button"
                            aria-label="Remove dataset"
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemoveDataset(dataset);
                            }}
                          >
                            <DeleteOutlineIcon
                              sx={{ color: "text.secondary" }}
                            />
                          </IconButton>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack>
                          {dataset.children.map((child) => (
                            <Stack
                              key={dataset.id + "-" + child.id}
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              spacing={2}
                              sx={{
                                pl: 2,
                                py: 1,
                              }}
                            >
                              <Typography variant="body1">
                                {child.label}
                              </Typography>
                              <IconButton
                                aria-label={`Remove ${child.label}`}
                                size="small"
                                onClick={() =>
                                  onRemoveFile(dataset.sampleId, child.id)
                                }
                              >
                                <RemoveIcon sx={{ color: "text.secondary" }} />
                              </IconButton>
                            </Stack>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                    {i !== bulkDownloadItems.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </Stack>
          </Box>
          <Divider />
          <Stack spacing={1} sx={{ p: 2 }}>
            <Typography >
              Select format
            </Typography>
            <Typography variant="caption" color="text.secondary">
              .zip or .tar.gz for a direct archive download, or shell script to
              pull the files yourself
            </Typography>
            {isOverArchiveLimit && (
              <Alert severity="warning">
                This selection is {formatBytes(totalSize)}, over the{" "}
                {formatBytes(ARCHIVE_SIZE_LIMIT_BYTES)} limit for .zip and
                .tar.gz archives. Download with the shell script, or remove
                files to get under the limit.
              </Alert>
            )}
            <RadioGroup
              row
              value={effectiveFormat}
              onChange={(event) =>
                setFormat(event.target.value as BulkDownloadFormat)
              }
              sx={{ gap: { xs: 1, sm: 2.5 }, flexWrap: "wrap" }}
            >
              {(Object.keys(FORMAT_LABELS) as BulkDownloadFormat[]).map(
                (key) => (
                  <FormControlLabel
                    key={key}
                    value={key}
                    control={<Radio />}
                    label={FORMAT_LABELS[key]}
                    disabled={isOverArchiveLimit && key !== "script"}
                    sx={{ mr: 0 }}
                  />
                ),
              )}
            </RadioGroup>
            {status === "failed" && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Couldn&apos;t start download. Check your connection and try
                again.
              </Alert>
            )}
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button
                onClick={handleClose}
                disabled={isSubmitting}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                endIcon={
                  isSubmitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Start />
                  )
                }
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
