"use client";

import { Fragment, useState } from "react";
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
import { useDownloadJobs, DownloadJob } from "@/common/context/DownloadJobsContext";
import { BulkDownloadFormat } from "@/common/hooks/useBulkDownloadJob";
import Config from "@/common/config.json";

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

function JobRow({ job }: { job: DownloadJob }) {
  const { removeJob, retryJob } = useDownloadJobs();
  const isActive = job.status === "pending" || job.status === "processing";
  const isDone = job.status === "done";
  const isFailed = job.status === "failed";
  const progress = Math.max(0, Math.min(100, job.progress ?? 0));
  const activeLabel = job.status === "processing" ? `Processing... ${progress}%` : STATUS_LABEL[job.status];

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
          {isDone && (
            <Tooltip title="Download archive" arrow placement="left">
              <IconButton
                size="small"
                color="primary"
                component="a"
                href={`${Config.API.BULK_DOWNLOAD}/download/${job.id}`}
                download
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {isFailed && (
            <Button size="small" onClick={() => retryJob(job.id)} sx={{ minWidth: 0, px: 1 }}>
              Retry
            </Button>
          )}
          {!isActive && (
            <Tooltip title="Dismiss" arrow placement="left">
              <IconButton size="small" onClick={() => removeJob(job.id)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="caption" color="text.secondary">
          {job.files.length} file{job.files.length !== 1 ? "s" : ""}
        </Typography>
        <Typography variant="caption" color="text.disabled">·</Typography>
        <Typography
          variant="caption"
          color={isFailed ? "error" : isActive ? "text.secondary" : "success.main"}
        >
          {isActive ? activeLabel : STATUS_LABEL[job.status]}
        </Typography>
      </Stack>

      {isActive && (
        <LinearProgress
          variant="determinate"
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
