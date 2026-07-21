"use client";

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  addJob: (job: DownloadJob) => void;
  updateJob: (
    id: string,
    patch: Partial<Pick<DownloadJob, "status" | "progress">>,
  ) => void;
  // Cancels the job upstream when it is still running, otherwise just dismisses it locally.
  removeJob: (id: string) => Promise<void>;
  retryJob: (id: string) => Promise<void>;
};

const STORAGE_KEY = "mohd_download_jobs";
const POLL_INTERVAL_MS = 500;
const BASE_URL = "/api/bulk-download";

const DownloadJobsContext = createContext<DownloadJobsContextValue | null>(
  null,
);

function loadFromStorage(): DownloadJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: DownloadJob[] = JSON.parse(raw);
    // Drop expired jobs on load, backfill fields added after initial release
    const now = Date.now();
    return parsed
      .filter((j) => Date.parse(j.expiresAt) > now)
      .map((j) => ({
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
      }));
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

export function DownloadJobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map(),
  );

  // Rehydrate from localStorage on mount, then start polling for active jobs
  useEffect(() => {
    const stored = loadFromStorage();
    setJobs(stored);
    stored
      .filter((j) => j.status === "pending" || j.status === "processing")
      .forEach((j) => startPolling(j.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever jobs change
  useEffect(() => {
    saveToStorage(jobs);
  }, [jobs]);

  // Cleanup all intervals on unmount
  useEffect(() => {
    const intervals = intervalsRef.current;
    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, []);

  const clearPoller = useCallback((id: string) => {
    const interval = intervalsRef.current.get(id);
    if (interval !== undefined) {
      clearInterval(interval);
      intervalsRef.current.delete(id);
    }
  }, []);

  const startPolling = useCallback(
    (id: string) => {
      if (intervalsRef.current.has(id)) return;
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${BASE_URL}/status/${id}`);
          if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
          const data: StatusResponse = await res.json();
          const progress = normalizeProgress(data.progress, data.status);

          if (data.status === "done" || data.status === "failed") {
            clearPoller(id);
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
          } else {
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
          }
        } catch {
          clearPoller(id);
          setJobs((prev) =>
            prev.map((j) => (j.id === id ? { ...j, status: "failed" } : j)),
          );
        }
      }, POLL_INTERVAL_MS);

      intervalsRef.current.set(id, interval);
    },
    [clearPoller],
  );

  const addJob = useCallback(
    (job: DownloadJob) => {
      setJobs((prev) => [job, ...prev]);
      startPolling(job.id);
    },
    [startPolling],
  );

  const updateJob = useCallback(
    (id: string, patch: Partial<Pick<DownloadJob, "status" | "progress">>) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, ...patch } : j)),
      );
    },
    [],
  );

  const removeJob = useCallback(
    async (id: string) => {
      const job = jobs.find((j) => j.id === id);
      const isRunning = job?.status === "pending" || job?.status === "processing";

      // Finished/failed jobs are only tray entries — dismissing them must never
      // reach the API, so a cleanup click can't kill someone else's job.
      if (!isRunning) {
        clearPoller(id);
        setJobs((prev) => prev.filter((j) => j.id !== id));
        return;
      }

      if (job?.cancelling) return;

      // Stop polling first so an in-flight status tick can't revive the row
      clearPoller(id);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id ? { ...j, cancelling: true, cancelError: undefined } : j,
        ),
      );

      try {
        const res = await fetch(`${BASE_URL}/jobs/${id}`, { method: "DELETE" });
        // 404 means the job is already gone upstream — same end state for us
        if (!res.ok && res.status !== 404)
          throw new Error(`Cancel failed: ${res.status}`);
        setJobs((prev) => prev.filter((j) => j.id !== id));
      } catch {
        // Keep the row and resume polling so its status stays live
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
        startPolling(id);
      }
    },
    [clearPoller, startPolling, jobs],
  );

  const retryJob = useCallback(
    async (id: string) => {
      const job = jobs.find((j) => j.id === id);
      if (!job) return;

      try {
        const res = await fetch(`${BASE_URL}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: job.format,
            files: job.files,
          }),
        });
        if (!res.ok) throw new Error(`Retry submission failed: ${res.status}`);
        const data: { id: string; expires_at: string } = await res.json();

        const updated: DownloadJob = {
          ...job,
          id: data.id,
          status: "pending",
          progress: 0,
          expiresAt: data.expires_at,
          ome: job.ome,
          fileCount: job.fileCount,
          filename: undefined,
          error: undefined,
          cancelling: false,
          cancelError: undefined,
        };

        // Replace old job with new one
        setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
        clearPoller(id);
        startPolling(data.id);
      } catch {
        // leave job as failed if retry POST itself fails
      }
    },
    [jobs, clearPoller, startPolling],
  );

  return (
    <DownloadJobsContext.Provider
      value={{ jobs, addJob, updateJob, removeJob, retryJob }}
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
