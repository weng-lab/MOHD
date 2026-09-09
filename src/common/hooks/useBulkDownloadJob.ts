import { useState } from "react";
import { useDownloadJobs } from "@/common/context/DownloadJobsContext";

export type BulkDownloadFormat = "zip" | "tarball" | "script";
export type ModalJobStatus = "idle" | "submitting" | "failed";

type JobResponse = {
  id: string;
  expires_at: string;
};

/**
 * Posts the job and collapses every failure mode into null. Kept at module
 * scope so the hook body stays free of the try/catch shape React Compiler
 * bails on.
 */
async function postJob(files: string[], format: BulkDownloadFormat): Promise<JobResponse | null> {
  try {
    const res = await fetch(`/api/bulk-download/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: format, files }),
    });

    if (!res.ok) return null;
    return (await res.json()) as JobResponse;
  } catch {
    return null;
  }
}

export function useBulkDownloadJob() {
  const [status, setStatus] = useState<ModalJobStatus>("idle");
  const { addJob } = useDownloadJobs();

  const reset = () => setStatus("idle");

  /** Resolves true once the job is accepted and queued, false if submission failed. */
  const submit = async (files: string[], format: BulkDownloadFormat, ome?: string): Promise<boolean> => {
    setStatus("submitting");

    const data = await postJob(files, format);
    if (!data) {
      setStatus("failed");
      return false;
    }

    addJob({
      id: data.id,
      format,
      files,
      status: "pending",
      progress: 0,
      expiresAt: data.expires_at,
      ome: ome ?? "Unknown",
      fileCount: files.length,
    });

    setStatus("idle");
    return true;
  };

  return { submit, status, reset };
}
