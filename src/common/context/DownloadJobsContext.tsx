"use client";

import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { BulkDownloadFormat } from "@/common/hooks/useBulkDownloadJob";

export type BulkJobStatus = "pending" | "processing" | "done" | "failed";

export type DownloadJob = {
  id: string;
  format: BulkDownloadFormat;
  files: string[];
  status: BulkJobStatus;
  progress: number;
  expiresAt: string;
  ome: string;
  fileCount: number;
  filename?: string;
  error?: string;
  // Static URL to the finished archive on the archive host. Present once done.
  downloadUrl?: string;
  sizeBytes?: number;
  // True while a cancellation request is in flight for this job.
  cancelling?: boolean;
  // Set when a cancellation attempt failed. Kept apart from `error`, which the
  // status poller overwrites on every tick.
  cancelError?: string;
};

type StatusResponse = {
  id: string;
  type: BulkDownloadFormat;
  status: BulkJobStatus;
  progress: number;
  expires_at: string;
  filename?: string;
  error?: string;
  download_url?: string;
  size_bytes?: number;
};

type DownloadJobsContextValue = {
  jobs: DownloadJob[];
  // Bumped once per fresh submission (addJob only). Lets the UI react to a new
  // download without mistaking a storage rehydrate on reload for one — the
  // restore repopulates `jobs` but never touches this.
  submitCount: number;
  addJob: (job: DownloadJob) => void;
  updateJob: (
    id: string,
    patch: Partial<Pick<DownloadJob, "status" | "progress">>,
  ) => void;
  // Cancels the job upstream when it is still running, otherwise just dismisses it locally.
  removeJob: (id: string) => Promise<void>;
  retryJob: (id: string) => Promise<void>;
};

// Versioned so a later change to DownloadJob's shape can be ignored rather than
// crashing a returning user's restore.
const STORAGE_KEY = "mohd_download_jobs:v1";
const POLL_INTERVAL_MS = 500;
const BASE_URL = "/api/bulk-download";

const DownloadJobsContext = createContext<DownloadJobsContextValue | null>(
  null,
);

/** A job the status poller should still be asking the service about. */
function isPollable(job: DownloadJob): boolean {
  return (
    !job.cancelling && (job.status === "pending" || job.status === "processing")
  );
}

function loadFromStorage(): DownloadJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: DownloadJob[] = JSON.parse(raw);
    // Drop expired jobs on load, backfill fields added after initial release
    const now = Date.now();
    const restored: DownloadJob[] = [];
    for (const j of parsed) {
      if (Date.parse(j.expiresAt) <= now) continue;
      restored.push({
        ...j,
        ome: j.ome ?? "Download",
        fileCount: j.fileCount ?? j.files?.length ?? 0,
        progress: Math.max(0, Math.min(100, j.progress ?? 0)),
        filename: j.filename,
        error: j.error,
        downloadUrl: j.downloadUrl,
        sizeBytes: j.sizeBytes,
        // A cancel in flight when the tab closed never completed
        cancelling: false,
        cancelError: undefined,
      });
    }
    return restored;
  } catch {
    return [];
  }
}

function normalizeProgress(progress?: number, status?: BulkJobStatus) {
  if (status === "done") return 100;
  if (typeof progress !== "number" || Number.isNaN(progress)) return 0;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

function saveToStorage(jobs: DownloadJob[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    // storage unavailable — fail silently
  }
}

/**
 * The service calls below each collapse their failure modes into one falsy
 * result. Keeping the network handling out here leaves the provider free of the
 * try/catch shapes React Compiler bails on, so it still gets optimized.
 */

/**
 * The job's latest status, or null when the request failed, wasn't parseable, or
 * was aborted. Callers distinguish the abort case themselves — see the poll
 * effect, which drops the result rather than reading it as a failed check.
 */
async function fetchJobStatus(
  id: string,
  signal: AbortSignal,
): Promise<StatusResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}/status/${id}`, { signal });
    if (!res.ok) return null;
    return (await res.json()) as StatusResponse;
  } catch {
    return null;
  }
}

/** True once the job is gone upstream — a 404 counts, it was already cleaned up. */
async function cancelJobUpstream(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/jobs/${id}`, { method: "DELETE" });
    return res.ok || res.status === 404;
  } catch {
    return false;
  }
}

/** The accepted job's id and expiry, or null when submission failed. */
async function submitJobUpstream(
  format: BulkDownloadFormat,
  files: string[],
): Promise<{ id: string; expires_at: string } | null> {
  try {
    const res = await fetch(`${BASE_URL}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: format, files }),
    });
    if (!res.ok) return null;
    return (await res.json()) as { id: string; expires_at: string };
  } catch {
    return null;
  }
}

export function DownloadJobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [submitCount, setSubmitCount] = useState(0);

  // Rehydrate from localStorage on mount. Reading storage while rendering would
  // disagree with the empty list the server rendered, so the restore has to land
  // after mount.
  useEffect(() => {
    // Deliberate: a lazy useState initializer would read storage during render
    // and hydrate a tray the server rendered empty.
    // react-doctor-disable-next-line react-hooks-js/set-state-in-effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJobs(loadFromStorage());
  }, []);

  // Persist whenever jobs change
  useEffect(() => {
    saveToStorage(jobs);
  }, [jobs]);

  // One timer per in-flight job, owned by this effect rather than started
  // imperatively — whenever the pollable set changes (a job finishes, fails, is
  // cancelled, or is retried under a new id) the old timers are torn down and
  // only the still-running ids get a fresh one.
  const pollableIds = jobs.flatMap((j) => (isPollable(j) ? [j.id] : [])).join(",");

  // Polling a job queue is genuinely an effect-and-timer job, and there is no
  // REST data-fetching layer to route it through — Apollo covers GraphQL only.
  // The hazards the rule names are each handled below: `inFlight` prevents
  // double-fire, the AbortController cancels the request on teardown, and
  // `stopped` keeps a late resolution from writing after this effect is gone.
  // Revisit if the service grows a progress stream — that turns this into a
  // subscription with no fetch in it at all.
  // react-doctor-disable-next-line react-doctor/no-fetch-in-effect
  useEffect(() => {
    if (!pollableIds) return;

    // A status request slower than the interval would otherwise stack up behind
    // itself, and a job that just finished would get one more request before the
    // state update tears this effect down.
    const controller = new AbortController();
    const inFlight = new Set<string>();
    let stopped = false;

    const tick = async (id: string) => {
      if (stopped || inFlight.has(id)) return;
      inFlight.add(id);
      const data = await fetchJobStatus(id, controller.signal);
      inFlight.delete(id);
      // A teardown abort also lands here as null, so this guard is what keeps it
      // from being written back as a failed status check.
      if (stopped) return;
      if (!data) {
        setJobs((prev) =>
          prev.map((j) => (j.id === id ? { ...j, status: "failed" } : j)),
        );
        return;
      }
      const progress = normalizeProgress(data.progress, data.status);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id
            ? {
                ...j,
                status: data.status,
                progress,
                expiresAt: data.expires_at,
                filename: data.filename,
                error: data.error,
                downloadUrl: data.download_url,
                sizeBytes: data.size_bytes,
              }
            : j,
        ),
      );
    };

    const timers = pollableIds
      .split(",")
      .map((id) => setInterval(() => void tick(id), POLL_INTERVAL_MS));

    return () => {
      stopped = true;
      controller.abort();
      timers.forEach(clearInterval);
    };
  }, [pollableIds]);

  const addJob = (job: DownloadJob) => {
    setJobs((prev) => [job, ...prev]);
    setSubmitCount((n) => n + 1);
  };

  const updateJob = (
    id: string,
    patch: Partial<Pick<DownloadJob, "status" | "progress">>,
  ) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  };

  const removeJob = async (id: string) => {
    const job = jobs.find((j) => j.id === id);
    const isRunning = job?.status === "pending" || job?.status === "processing";

    // Finished/failed jobs are only tray entries — dismissing them must never
    // reach the API, so a cleanup click can't kill someone else's job.
    if (!isRunning) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      return;
    }

    if (job?.cancelling) return;

    // Flagging it `cancelling` drops it out of the pollable set, which stops its
    // timer before the DELETE goes out so a status tick can't revive the row.
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, cancelling: true, cancelError: undefined } : j,
      ),
    );

    if (await cancelJobUpstream(id)) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      return;
    }

    // Keep the row and clear `cancelling`, which puts it back in the pollable
    // set so its status stays live.
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? {
              ...j,
              cancelling: false,
              cancelError: "Could not cancel — try again",
            }
          : j,
      ),
    );
  };

  const retryJob = async (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    const data = await submitJobUpstream(job.format, job.files);
    // leave job as failed if retry POST itself fails
    if (!data) return;

    // Replace old job with new one; the poll effect picks up the new id.
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? {
              ...job,
              id: data.id,
              status: "pending",
              progress: 0,
              expiresAt: data.expires_at,
              filename: undefined,
              error: undefined,
              cancelling: false,
              cancelError: undefined,
            }
          : j,
      ),
    );
  };

  return (
    <DownloadJobsContext.Provider
      value={{ jobs, submitCount, addJob, updateJob, removeJob, retryJob }}
    >
      {children}
    </DownloadJobsContext.Provider>
  );
}

export function useDownloadJobs(): DownloadJobsContextValue {
  const ctx = useContext(DownloadJobsContext);
  if (!ctx)
    throw new Error("useDownloadJobs must be used within DownloadJobsProvider");
  return ctx;
}
