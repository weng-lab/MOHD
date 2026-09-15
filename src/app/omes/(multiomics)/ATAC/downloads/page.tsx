"use client";
import OmeDualPaneDownloads, { type OmeDownloadsConfig } from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type ATACRow = BaseSampleMetadata & { protocol: string };

const config: OmeDownloadsConfig<ATACRow> = {
  omeKey: "atac",
  displayName: "ATAC-seq",
  datasetFilters: [
    { field: "site", label: "Site" },
    { field: "status", label: "Status" },
    { field: "sex", label: "Sex" },
    { field: "protocol", label: "Protocol" },
  ],
};

const ATACDownloads = () => <OmeDualPaneDownloads config={config} />;

export default ATACDownloads;
