import { useCallback, useState } from "react";
import Config from "../config.json";
import { useDownloadJobs } from "@/common/context/DownloadJobsContext";
import { getMockBulkDownloadFiles } from "@/common/bulkDownloadMocks";

export type BulkDownloadFormat = "zip" | "tarball" | "script";
export type ModalJobStatus = "idle" | "submitting" | "submitted" | "failed";

type JobResponse = {
  id: string;
  expires_at: string;
};

const BASE_URL = Config.API.BULK_DOWNLOAD;

export function useBulkDownloadJob() {
  const [status, setStatus] = useState<ModalJobStatus>("idle");
  const { addJob } = useDownloadJobs();

  const reset = useCallback(() => setStatus("idle"), []);

  const submit = async (
    files: string[],
    format: BulkDownloadFormat,
    ome?: string,
  ) => {
    setStatus("submitting");
    // const mockFiles = getMockBulkDownloadFiles(format);

    try {
      const res = await fetch(`${BASE_URL}/jobs`, {
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

      setStatus("submitted");
    } catch {
      setStatus("failed");
    }
  };

  return { submit, status, reset };
}
