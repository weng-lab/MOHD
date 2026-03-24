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
import Config from "@/common/config.json";
import { getMockBulkDownloadFiles } from "@/common/bulkDownloadMocks";

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
};

type StatusResponse = {
  id: string;
  type: BulkDownloadFormat;
  status: BulkJobStatus;
  progress: number;
  expires_at: string;
  filename?: string;
  error?: string;
};

type DownloadJobsContextValue = {
  jobs: DownloadJob[];
  addJob: (job: DownloadJob) => void;
  updateJob: (
    id: string,
    patch: Partial<Pick<DownloadJob, "status" | "progress">>,
  ) => void;
  removeJob: (id: string) => void;
  retryJob: (id: string) => Promise<void>;
};

const STORAGE_KEY = "mohd_download_jobs";
const POLL_INTERVAL_MS = 500;
const BASE_URL = Config.BULK_DOWNLOAD;

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
    (id: string) => {
      clearPoller(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    },
    [clearPoller],
  );

  const retryJob = useCallback(
    async (id: string) => {
      const job = jobs.find((j) => j.id === id);
      if (!job) return;

      try {
        const mockFiles = getMockBulkDownloadFiles(job.format);
        const res = await fetch(`${BASE_URL}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: job.format,
            files: mockFiles,
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
