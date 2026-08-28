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
  Fab,
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
import { FolderZip } from "@mui/icons-material";

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

// Whether submitting a download pops the tray open so the new job surfaces.
// Reloading the page and rehydrating stored jobs never opens it — only a fresh
// submission does. Flip to false to leave the tray closed until the user opens
// it themselves.
const AUTO_OPEN_ON_SUBMIT = true;

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
  // Starts at 0 rather than the current time: reading the clock during render is
  // request-time data, which cacheComponents refuses to prerender. Nothing reads
  // as expired at 0, which is accurate - loadFromStorage prunes expired jobs at
  // startup, so every job present at mount is still live. The timer below takes
  // over from there.
  const [now, setNow] = useState(0);

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
 * Downloads menu: a floating action button in the bottom-right corner that
 * opens the job list as a popover above it. Replaced the old always-open
 * fixed card — shrinking it to a single FAB means it only clips the
 * page-scoped BulkDownloadChip on narrow widths (the card overlapped it below
 * ~1390px), and the chip's empty sides are click-through so the FAB stays
 * reachable. The button only appears once there are jobs.
 */
export default function DownloadJobsMenu() {
  const { jobs, submitCount } = useDownloadJobs();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [commandJobId, setCommandJobId] = useState<string | null>(null);
  const now = useExpiryClock(jobs);
  const open = Boolean(anchorEl);

  // A dot on the tray button flags a job that reached a terminal state (ready
  // or failed) while the tray was closed, so a finished download gets noticed
  // without the count-in-a-circle badge that was awkward to fit around the
  // icon. Opening the tray means the user has seen the change and clears it
  // (handled at the open handlers below).
  const finishedCount = jobs.filter(
    (j) => j.status === "done" || j.status === "failed"
  ).length;
  const [prevFinishedCount, setPrevFinishedCount] = useState(finishedCount);
  const [hasUnseenCompletion, setHasUnseenCompletion] = useState(false);

  // Detect the transition during render rather than in an effect: an effect
  // would commit, then setState, then re-render — the cascading render React
  // warns about. Adjusting state from a prior render's value here is the
  // sanctioned pattern.
  if (finishedCount !== prevFinishedCount) {
    setPrevFinishedCount(finishedCount);
    if (finishedCount > prevFinishedCount && !open) {
      // A job crossed into a terminal state while the tray was closed.
      setHasUnseenCompletion(true);
    } else if (finishedCount === 0) {
      // Tray emptied: no finished job can be unseen, so drop the flag before a
      // fresh batch reuses this still-mounted component.
      setHasUnseenCompletion(false);
    }
  }

  // Open the tray when a download is submitted (opt-in via AUTO_OPEN_ON_SUBMIT)
  // so the new job surfaces without the user hunting for the button. Driven by
  // submitCount, which the context bumps only on a fresh submission — a reload
  // that rehydrates jobs from storage leaves it untouched, so restored jobs no
  // longer pop the tray, and every submission now behaves the same rather than
  // only the first of a batch. Anchored off the button ref rather than a click
  // target: this runs in an effect, i.e. after the button has mounted, so the
  // ref is populated — otherwise the popover has no anchor and MUI drops it in
  // the top-left corner.
  const prevSubmitCount = useRef(submitCount);
  useEffect(() => {
    if (submitCount === prevSubmitCount.current) return;
    prevSubmitCount.current = submitCount;
    if (AUTO_OPEN_ON_SUBMIT) setAnchorEl(buttonRef.current);
  }, [submitCount]);

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

  // Nothing to surface until a download exists.
  if (jobs.length === 0) return null;

  return (
    <>
      {/* Floating button in the bottom-right corner. Sits on the FAB layer,
          below the BulkDownloadChip (appBar + 2), so on the narrow widths where
          the centered chip reaches this corner the chip's action stays on top —
          the chip's empty sides are click-through so the button is otherwise
          reachable. */}
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: (theme) => theme.zIndex.fab,
        }}
      >
        <Tooltip title="Downloads" arrow placement="left">
          <Fab
            ref={buttonRef}
            color="primary"
            size="medium"
            aria-label={`Downloads (${jobs.length})`}
            onClick={() => {
              if (open) {
                setAnchorEl(null);
              } else {
                setAnchorEl(buttonRef.current);
                setHasUnseenCompletion(false);
              }
            }}
          >
            <Badge
              variant="dot"
              color="secondary"
              overlap="circular"
              invisible={!hasUnseenCompletion}
            >
              <FolderZip />
            </Badge>
            {activeCount > 0 && (
              <CircularProgress
                size={48}
                thickness={2}
                sx={{
                  position: "absolute",
                  color: "primary.contrastText",
                  pointerEvents: "none",
                }}
              />
            )}
          </Fab>
        </Tooltip>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: -8, horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
        disableScrollLock
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxWidth: "calc(100vw - 24px)",
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
            Bulk Downloads
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
