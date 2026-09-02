"use client";
import OmeDualPaneDownloads, {
  type OmeDownloadsConfig,
} from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type ATACRow = BaseSampleMetadata & { protocol: string };

const config: OmeDownloadsConfig<ATACRow> = {
  omeKey: "atac",
  displayName: "ATAC-seq",
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "protocol", label: "Protocol" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const ATACDownloads = () => <OmeDualPaneDownloads config={config} />;

export default ATACDownloads;
