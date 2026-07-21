"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  LinearProgress,
  Button,
  Chip,
  Collapse,
  Tooltip,
  Divider,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDownloadJobs, DownloadJob } from "@/common/context/DownloadJobsContext";
import { BulkDownloadFormat } from "@/common/hooks/useBulkDownloadJob";
import { formatBytes } from "@/common/downloads";

const FORMAT_LABELS: Record<BulkDownloadFormat, string> = {
  zip: "zip",
  tarball: "tar.gz",
  script: "sh",
};

const STATUS_LABEL: Record<DownloadJob["status"], string> = {
  pending: "Queued",
  processing: "Processing…",
  done: "Ready",
  failed: "Failed",
};

type CopyState = "idle" | "copied" | "error";

function JobRow({ job }: { job: DownloadJob }) {
  const { removeJob, retryJob } = useDownloadJobs();
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive = job.status === "pending" || job.status === "processing";
  const isDone = job.status === "done";
  const isFailed = job.status === "failed";
  const isCancelling = Boolean(job.cancelling);
  const progress = Math.max(0, Math.min(100, job.progress ?? 0));
  const activeLabel = isCancelling
    ? "Cancelling…"
    : job.status === "processing"
      ? `Processing... ${progress}%`
      : STATUS_LABEL[job.status];

  // The row unmounts as soon as the job is dismissed, so a pending revert must
  // not outlive it.
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const handleCopyLink = async () => {
    if (!job.downloadUrl) return;
    try {
      // Absolutised so the link still resolves once pasted onto another
      // machine, whatever shape the archive host hands back.
      const url = new URL(job.downloadUrl, window.location.origin).href;
      // Undefined outside a secure context, where writeText isn't reachable.
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState("idle"), 2000);
  };

  const copyTooltip =
    copyState === "copied"
      ? "Link copied"
      : copyState === "error"
        ? "Couldn't copy — copy it from the download button instead"
        : job.format === "script"
          ? "Copy script link"
          : "Copy archive link";

  return (
    <Stack spacing={0.75} sx={{ py: 1.5, px: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Chip
            label={FORMAT_LABELS[job.format]}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontSize: "0.65rem", height: 20 }}
          />
          <Typography
            variant="body2"
            fontWeight={500}
            noWrap
            sx={{ maxWidth: 180 }}
            title={`${job.ome || "Download"} \u00b7 ${job.fileCount ?? 0} file${job.fileCount !== 1 ? "s" : ""}`}
          >
            {job.ome || "Download"}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {isDone && job.downloadUrl && (
            <>
              <Tooltip
                title={job.format === "script" ? "Download script" : "Download archive"}
                arrow
                placement="left"
              >
                <IconButton
                  size="small"
                  component="a"
                  href={job.downloadUrl}
                  download
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={copyTooltip} arrow placement="left">
                <IconButton
                  aria-label={copyTooltip}
                  size="small"
                  color={copyState === "copied" ? "success" : "default"}
                  onClick={() => void handleCopyLink()}
                >
                  {copyState === "copied" ? (
                    <CheckIcon fontSize="small" />
                  ) : (
                    <ContentCopyIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </>
          )}
          {isFailed && (
            <Button size="small" onClick={() => retryJob(job.id)} sx={{ minWidth: 0, px: 1 }}>
              Retry
            </Button>
          )}
          <Tooltip
            title={isActive ? "Cancel download" : "Dismiss"}
            arrow
            placement="left"
          >
            {/* span keeps the tooltip working while the button is disabled */}
            <span>
              <IconButton
                size="small"
                disabled={isCancelling}
                onClick={() => void removeJob(job.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="caption" color="text.secondary">
          {job.files.length} file{job.files.length !== 1 ? "s" : ""}
        </Typography>
        {job.sizeBytes ? (
          <>
            <Typography variant="caption" color="text.disabled">·</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatBytes(job.sizeBytes)}
            </Typography>
          </>
        ) : null}
        <Typography variant="caption" color="text.disabled">·</Typography>
        <Typography
          variant="caption"
          color={isFailed ? "error" : isActive ? "text.secondary" : "success.main"}
        >
          {isActive ? activeLabel : STATUS_LABEL[job.status]}
        </Typography>
      </Stack>

      {job.cancelError && (
        <Typography variant="caption" color="error">
          {job.cancelError}
        </Typography>
      )}

      {isActive && (
        <LinearProgress
          variant={isCancelling ? "indeterminate" : "determinate"}
          value={progress}
          sx={{ borderRadius: 1, height: 3 }}
        />
      )}
    </Stack>
  );
}

export default function DownloadJobsTray() {
  const { jobs } = useDownloadJobs();
  const [expanded, setExpanded] = useState(true);

  if (jobs.length === 0) return null;

  const activeCount = jobs.filter(
    (j) => j.status === "pending" || j.status === "processing"
  ).length;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 320,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 6,
        zIndex: 1400,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2,
          py: 1.25,
          cursor: "pointer",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <DownloadIcon fontSize="small" />
          <Typography variant="body2" fontWeight={600}>
            Downloads
          </Typography>
          {activeCount > 0 && (
            <Chip
              label={activeCount}
              size="small"
              sx={{
                height: 18,
                fontSize: "0.65rem",
                bgcolor: "primary.contrastText",
                color: "primary.main",
                fontWeight: 700,
              }}
            />
          )}
        </Stack>
        <IconButton size="small" sx={{ color: "primary.contrastText", p: 0 }}>
          {expanded ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
        </IconButton>
      </Stack>

      {/* Job list */}
      <Collapse in={expanded}>
        <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
          {jobs.map((job, i) => (
            <Fragment key={job.id}>
              {i > 0 && <Divider />}
              <JobRow job={job} />
            </Fragment>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
