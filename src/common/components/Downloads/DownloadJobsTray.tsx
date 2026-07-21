"use client";

import { Fragment, useEffect, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TerminalIcon from "@mui/icons-material/Terminal";
import { useDownloadJobs, DownloadJob } from "@/common/context/DownloadJobsContext";
import { BulkDownloadFormat } from "@/common/hooks/useBulkDownloadJob";
import { formatBytes } from "@/common/downloads";
import DownloadCommandModal from "./DownloadCommandModal";

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

/**
 * Returns a clock that advances whenever a job's expiry passes, so a row can
 * flip to "Expired" without waiting for a reload — loadFromStorage only prunes
 * expired jobs at startup, which leaves a long-lived tab offering links the
 * service has already cleaned up.
 *
 * Arms a single timer at the nearest future expiry rather than polling, so a
 * tray left open all day costs one wakeup per job. Firing late (a throttled
 * background tab, a sleeping machine) is harmless: expiry is recomputed against
 * this clock on every render, so a late tick just reports the truth later.
 */
function useExpiryClock(jobs: DownloadJob[]): number {
  const [now, setNow] = useState(() => Date.now());

  const nextExpiry = jobs.reduce<number | null>((soonest, job) => {
    const expiry = Date.parse(job.expiresAt);
    if (Number.isNaN(expiry) || expiry <= now) return soonest;
    return soonest === null || expiry < soonest ? expiry : soonest;
  }, null);

  useEffect(() => {
    if (nextExpiry === null) return;
    // Past the deadline by a margin, so the tick cannot land a millisecond
    // early and re-arm on the same expiry.
    const timer = setTimeout(() => setNow(Date.now()), nextExpiry - Date.now() + 250);
    return () => clearTimeout(timer);
  }, [nextExpiry]);

  return now;
}

function JobRow({
  job,
  isExpired,
  onShowCommands,
}: {
  job: DownloadJob;
  isExpired: boolean;
  onShowCommands: (id: string) => void;
}) {
  const { removeJob, retryJob } = useDownloadJobs();
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
          {/* Both actions lead to the archive host, which 404s once the service
              has swept the artifact — so expiry retires them together. */}
          {isDone && job.downloadUrl && !isExpired && (
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
              <Tooltip title="Get command" arrow placement="left">
                <IconButton
                  aria-label="Get command"
                  size="small"
                  onClick={() => onShowCommands(job.id)}
                >
                  <TerminalIcon fontSize="small" />
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
          color={
            isFailed
              ? "error"
              : isExpired || isActive
                ? "text.secondary"
                : "success.main"
          }
        >
          {isExpired ? "Expired" : isActive ? activeLabel : STATUS_LABEL[job.status]}
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
  const [commandJobId, setCommandJobId] = useState<string | null>(null);
  const now = useExpiryClock(jobs);

  if (jobs.length === 0) return null;

  const activeCount = jobs.filter(
    (j) => j.status === "pending" || j.status === "processing"
  ).length;

  const hasExpired = (job: DownloadJob) => {
    const expiry = Date.parse(job.expiresAt);
    return !Number.isNaN(expiry) && expiry <= now;
  };

  const commandJob = commandJobId
    ? jobs.find((j) => j.id === commandJobId) ?? null
    : null;

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
              <JobRow
                job={job}
                isExpired={hasExpired(job)}
                onShowCommands={setCommandJobId}
              />
            </Fragment>
          ))}
        </Box>
      </Collapse>

      {commandJob?.downloadUrl && (
        <DownloadCommandModal
          job={commandJob}
          downloadUrl={commandJob.downloadUrl}
          isExpired={hasExpired(commandJob)}
          onClose={() => setCommandJobId(null)}
        />
      )}
    </Box>
  );
}
