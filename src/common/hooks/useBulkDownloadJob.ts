import { useCallback, useState } from "react";
import { useDownloadJobs } from "@/common/context/DownloadJobsContext";

export type BulkDownloadFormat = "zip" | "tarball" | "script";
export type ModalJobStatus = "idle" | "submitting" | "failed";

type JobResponse = {
  id: string;
  expires_at: string;
};

export function useBulkDownloadJob() {
  const [status, setStatus] = useState<ModalJobStatus>("idle");
  const { addJob } = useDownloadJobs();

  const reset = useCallback(() => setStatus("idle"), []);

  /** Resolves true once the job is accepted and queued, false if submission failed. */
  const submit = async (
    files: string[],
    format: BulkDownloadFormat,
    ome?: string,
  ): Promise<boolean> => {
    setStatus("submitting");
    // const mockFiles = getMockBulkDownloadFiles(format);

    try {
      const res = await fetch(`/api/bulk-download/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: format,
          // files: mockFiles,
          files
        }),
      });

      if (!res.ok) throw new Error(`Job submission failed: ${res.status}`);

      const data: JobResponse = await res.json();

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
    } catch {
      setStatus("failed");
      return false;
    }
  };

  return { submit, status, reset };
}
