"use client";
import OmeDualPaneDownloads, {
  type OmeDownloadsConfig,
} from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type RnaRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<RnaRow> = {
  omeKey: "rna",
  displayName: "RNA-seq",
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const RnaDownloads = () => <OmeDualPaneDownloads config={config} />;

export default RnaDownloads;
