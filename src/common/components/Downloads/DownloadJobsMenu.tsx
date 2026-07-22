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
  Badge,
  Popover,
  CircularProgress,
  Tooltip,
  Divider,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
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
                placement="bottom"
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
              <Tooltip title="Get command" arrow placement="bottom">
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
            title={isActive ? "Cancel download" : "Remove"}
            arrow
            placement="bottom"
          >
            {/* span keeps the tooltip working while the button is disabled */}
            <span>
              <IconButton
                size="small"
                disabled={isCancelling}
                onClick={() => void removeJob(job.id)}
              >
                <DeleteForeverIcon fontSize="small" />
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

/**
 * Header-anchored downloads menu: a badge in the toolbar that opens the job
 * list as a popover. Lives in the header rather than as a fixed bottom-right
 * card so it no longer competes for the bottom of the viewport with the
 * page-scoped BulkDownloadChip — the two used to overlap below ~1390px. The
 * button only appears once there are jobs, matching the old tray's behavior.
 */
export default function DownloadJobsMenu() {
  const { jobs } = useDownloadJobs();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [commandJobId, setCommandJobId] = useState<string | null>(null);
  // Whether the popover has already auto-opened for the current run of jobs,
  // so a second job in the same batch doesn't re-pop it. Resets once the tray
  // empties so a fresh batch surfaces again.
  const hasAutoOpened = useRef(false);
  const now = useExpiryClock(jobs);

  // Auto-open the popover when the first job appears so a freshly submitted
  // download surfaces without the user hunting for the badge. Anchored off the
  // button ref rather than a click target: this runs in an effect, i.e. after
  // the icon has mounted, so the ref is populated — otherwise the popover has
  // no anchor and MUI drops it in the top-left corner.
  useEffect(() => {
    if (jobs.length === 0) {
      hasAutoOpened.current = false;
      return;
    }
    if (!hasAutoOpened.current) {
      hasAutoOpened.current = true;
      setAnchorEl(buttonRef.current);
    }
  }, [jobs.length]);

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

  // Nothing to surface in the header until a download exists.
  if (jobs.length === 0) return null;

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Downloads" arrow>
        <IconButton
          ref={buttonRef}
          aria-label={`Downloads (${jobs.length})`}
          onClick={() => setAnchorEl((prev) => (prev ? null : buttonRef.current))}
          sx={{ color: "primary.main", position: "relative" }}
        >
          <Badge badgeContent={jobs.length} overlap="circular">
            <DownloadIcon />
          </Badge>
          {/* Ambient signal that a job is still running, since the panel is
              now collapsed into an icon instead of an always-open card. */}
          {activeCount > 0 && (
            <CircularProgress
              size={48}
              thickness={2}
              sx={{
                position: "absolute",
                transform: "translate(-50%, -50%)",
                color: "primary.main",
                pointerEvents: "none",
              }}
            />
          )}
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        disableScrollLock
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxWidth: "calc(100vw - 24px)",
              mt: 1,
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 6,
            },
          },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            px: 2,
            py: 1.25,
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
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
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Close" arrow>
            <IconButton
              aria-label="Close downloads menu"
              size="small"
              onClick={() => setAnchorEl(null)}
              sx={{ color: "primary.contrastText" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Job list */}
        <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
          {jobs.map((job, i) => (
            <Fragment key={job.id}>
              {i > 0 && <Divider />}
              <JobRow
                job={job}
                isExpired={hasExpired(job)}
                // Close the popover so the command dialog isn't layered
                // underneath it.
                onShowCommands={(id) => {
                  setCommandJobId(id);
                  setAnchorEl(null);
                }}
              />
            </Fragment>
          ))}
        </Box>
      </Popover>

      {commandJob?.downloadUrl && (
        <DownloadCommandModal
          job={commandJob}
          downloadUrl={commandJob.downloadUrl}
          isExpired={hasExpired(commandJob)}
          onClose={() => setCommandJobId(null)}
        />
      )}
    </>
  );
}
