import { useEffect, useMemo, useState } from "react";
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
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RemoveIcon from "@mui/icons-material/Remove";
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

type DisplayTreeItem = {
  id: string;
  label: string;
  children: { id: string; label: string }[];
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
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const { submit, status, reset } = useBulkDownloadJob();

  useEffect(() => {
    if (status === "submitted") {
      reset();
      onClose();
    }
  }, [status, onClose, reset]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const isSubmitting = status === "submitting";

  const datasetItems = useMemo<DisplayTreeItem[]>(
    () =>
      (fileTreeItems ?? []).map((item) => ({
        id: item.id,
        label: item.label ?? "",
        children: (item.children ?? []).map((child) => ({
          id: child.id,
          label: child.label ?? "",
        })),
      })),
    [fileTreeItems],
  );

  const datasetCount = datasetItems.length;

  const handleSubmit = () => {
    submit(filePaths, format, ome);
  };

  const handleClose = () => {
    setExpandedIds([]);
    onClose();
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((currentId) => currentId !== id)
        : [...current, id],
    );
  };

  return (
    <Modal open={open} onClose={handleClose}>
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
          <Stack spacing={.5} p={2}>
            <Stack direction="row" justifyContent="space-between" alignItems={"flex-start"}>
              <Box>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  Bulk Download
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Review and remove datasets or individual files before
                  downloading.
                </Typography>
              </Box>
              <IconButton onClick={handleClose} sx={{ mt: -0.5, mr: -0.5 }}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <Alert
              severity="info"
              sx={{
                py: 0.25,
                borderRadius: 2,
                bgcolor: "#E5F3FB",
                color: "#0B5F8A",
                "& .MuiAlert-message": {
                  width: "100%",
                },
              }}
            >
              Downloads open access files only. AnVIL restricted files not
              included
            </Alert>
          </Stack>
          <Divider />
          <Box
            sx={{
              p: 2,
              bgcolor: "#FAFAF8",
            }}
          >
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="subtitle1">
                <b>{filePaths.length} file{filePaths.length !== 1 ? "s" : ""} •{" "}
                  {formatBytes(totalSize)}</b>
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {datasetCount} sample{datasetCount !== 1 ? "s" : ""}
              </Typography>
            </Stack>
            {filterSummary && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Filtered by: {filterSummary}
              </Typography>
            )}
          </Box>
          <Divider />
          <Box
            sx={{
              p: 2,
              overflowY: "auto",
              flex: 1,
            }}
          >
            <Stack>
              {datasetItems.map((dataset) => {
                const datasetTitle = dataset.label.replace(
                  /\s*\(\d+\sfiles?\)\s*$/,
                  "",
                );

                return (
                  <>
                    <Accordion
                      key={dataset.id}
                      expanded={expandedIds.includes(dataset.id)}
                      onChange={() => toggleExpanded(dataset.id)}
                      disableGutters
                      elevation={0}
                      square
                      sx={{
                        overflow: "hidden",
                        "&::before": {
                          display: "none",
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          px: 1,
                          py: 2,
                          bgcolor: expandedIds.includes(dataset.id)
                            ? "#EEF3F1"
                            : "transparent",
                          "& .MuiAccordionSummary-content": {
                            my: 0,
                          },
                        }}
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
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 0, py: 0.5 }}>
                        <Stack>
                          {dataset.children.map((child) => (
                            <Stack
                              key={child.id}
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              spacing={2}
                              sx={{
                                pl: 6,
                                pr: 2,
                                py: 1.75,
                              }}
                            >
                              <Typography variant="body1">
                                {child.label}
                              </Typography>
                              <RemoveIcon sx={{ color: "text.secondary" }} />
                            </Stack>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                    <Divider />
                  </>
                );
              })}
            </Stack>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              Select format
            </Typography>
            <RadioGroup
              row
              value={format}
              onChange={(event) =>
                setFormat(event.target.value as BulkDownloadFormat)
              }
              sx={{ gap: { xs: 1, sm: 2.5 }, flexWrap: "wrap" }}
            >
              {(Object.keys(FORMAT_LABELS) as BulkDownloadFormat[]).map((key) => (
                <FormControlLabel
                  key={key}
                  value={key}
                  control={<Radio />}
                  label={FORMAT_LABELS[key]}
                  sx={{ mr: 0 }}
                />
              ))}
            </RadioGroup>
            <Typography variant="body1" color="text.secondary" sx={{ my: 1 }}>
              .zip or .tar.gz for a direct archive download, or shell script to
              pull the files yourself
            </Typography>
            {status === "failed" && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Couldn&apos;t start download. Check your connection and try
                again.
              </Alert>
            )}
            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1}
            >
              <Button
                onClick={handleClose}
                disabled={isSubmitting}
                variant="outlined"
              >
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
                {isSubmitting ? "Submitting..." : "Start Download"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default BulkDownloadModal;
