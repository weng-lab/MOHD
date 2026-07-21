"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Checkbox,
  Divider,
  Fade,
  FormControlLabel,
  IconButton,
  Modal,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { DownloadJob } from "@/common/context/DownloadJobsContext";
import {
  CommandPlatform,
  FORMAT_DESCRIPTIONS,
  PLATFORM_LABELS,
  artifactName,
  buildCommandPlan,
  detectPlatform,
} from "@/common/downloadCommands";
import { formatBytes, formatExpiry } from "@/common/downloads";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

type CopyState = "idle" | "copied" | "error";

function CopyButton({
  text,
  label,
  onDark = false,
}: {
  text: string;
  label: string;
  onDark?: boolean;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The button can unmount on a tab switch or a close, so a pending revert must
  // not outlive it.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleCopy = async () => {
    try {
      // Undefined outside a secure context, where writeText isn't reachable.
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  };

  const title =
    state === "copied"
      ? "Copied"
      : state === "error"
        ? "Couldn't copy — select the text and copy it manually"
        : label;

  return (
    <Tooltip title={title} arrow placement="left">
      <IconButton
        aria-label={title}
        size="small"
        onClick={() => void handleCopy()}
        sx={{
          color: onDark ? "rgba(255,255,255,0.75)" : "text.secondary",
          bgcolor: onDark ? "rgba(255,255,255,0.08)" : undefined,
          ...(state === "copied" && { color: "success.light" }),
          "&:hover": { bgcolor: onDark ? "rgba(255,255,255,0.18)" : undefined },
        }}
      >
        {state === "copied" ? (
          <CheckIcon fontSize="small" />
        ) : (
          <ContentCopyIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

function CommandBlock({ command }: { command: string }) {
  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "primary.dark",
        borderRadius: 1.5,
        py: 1.25,
        pl: 1.5,
        pr: 6,
      }}
    >
      <Typography
        component="code"
        sx={{
          display: "block",
          fontFamily: MONO,
          fontSize: "0.78rem",
          lineHeight: 1.7,
          color: "#d6ede8",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {command}
      </Typography>
      <Box sx={{ position: "absolute", top: 6, right: 6 }}>
        <CopyButton text={command} label="Copy command" onDark />
      </Box>
    </Box>
  );
}

export type DownloadCommandModalProps = {
  job: DownloadJob;
  /** Absolute URL to the finished artifact. */
  downloadUrl: string;
  /**
   * True once the artifact's link is dead. Only reachable by a job expiring
   * while this modal is open — the tray retires the button that opens it — so
   * handing over commands that would 404 is the case to guard.
   */
  isExpired: boolean;
  onClose: () => void;
};

export default function DownloadCommandModal({
  job,
  downloadUrl,
  isExpired,
  onClose,
}: DownloadCommandModalProps) {
  const [platform, setPlatform] = useState<CommandPlatform>(detectPlatform);
  const [inspectFirst, setInspectFirst] = useState(false);

  const filename = artifactName(job.format, downloadUrl, job.filename);
  const plan = buildCommandPlan({
    format: job.format,
    url: downloadUrl,
    filename,
    platform,
    inspectFirst,
  });

  // Only scripts run downloaded code, so only scripts are worth reading first.
  const showInspectToggle = job.format === "script";
  const expiry = formatExpiry(job.expiresAt);

  return (
    <Modal open onClose={onClose}>
      <Fade in>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "calc(100vw - 32px)", sm: 540 },
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "calc(100vh - 48px)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 3,
            outline: "none",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ p: 2, pb: 1.5 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6">Get {job.ome || "download"}</Typography>
              <Typography variant="body2" color="text.secondary">
                {job.fileCount} file{job.fileCount !== 1 ? "s" : ""}
                {job.sizeBytes ? ` · ${formatBytes(job.sizeBytes)}` : ""}
                {` · ${FORMAT_DESCRIPTIONS[job.format]}`}
              </Typography>
            </Box>
            <IconButton aria-label="Close" onClick={onClose} sx={{ mt: -0.5, mr: -0.5 }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {!isExpired && (
            <Tabs
              value={platform}
              onChange={(_, value: CommandPlatform) => setPlatform(value)}
              sx={{ px: 2, minHeight: 40, borderBottom: 1, borderColor: "divider" }}
            >
              {(Object.keys(PLATFORM_LABELS) as CommandPlatform[]).map((key) => (
                <Tab
                  key={key}
                  value={key}
                  label={PLATFORM_LABELS[key]}
                  sx={{ minHeight: 40, py: 0 }}
                />
              ))}
            </Tabs>
          )}

          <Box sx={{ p: 2, overflowY: "auto", flex: 1 }}>
            {isExpired ? (
              // Every command and the link all point at an artifact the service
              // has already deleted, so none of them are offered — a copyable
              // command that 404s is worse than no command.
              <Alert severity="error">
                This link has expired and the files have been cleaned up. Start a
                new download to get a fresh one.
              </Alert>
            ) : (
              <Stack spacing={1.5}>
                {plan.note && (
                  <Alert severity="warning" sx={{ py: 0.25 }}>
                    {plan.note}
                  </Alert>
                )}

                {plan.steps.map((step, i) => (
                  <Stack key={i} spacing={0.5}>
                    {step.caption && (
                      <Typography variant="caption" color="text.secondary">
                        {step.caption}
                      </Typography>
                    )}
                    <CommandBlock command={step.command} />
                  </Stack>
                ))}

                {showInspectToggle && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={inspectFirst}
                        onChange={(event) => setInspectFirst(event.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Download the script first, then run it
                      </Typography>
                    }
                    sx={{ ml: -1 }}
                  />
                )}

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Or copy the link
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      mt: 0.5,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1.5,
                      pl: 1.5,
                      pr: 0.5,
                      py: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: MONO,
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={downloadUrl}
                    >
                      {downloadUrl}
                    </Typography>
                    <CopyButton text={downloadUrl} label="Copy link" />
                  </Stack>
                </Box>
              </Stack>
            )}
          </Box>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{
              px: 2,
              py: 1.25,
              bgcolor: "surface.light",
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {expiry ? `Link ${expiry}` : "Link expires 24 hours after the job finishes"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Open access files only
            </Typography>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
}
