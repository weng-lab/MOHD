"use client";
import OmeDualPaneDownloads, { type OmeDownloadsConfig } from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type MetallomicsRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<MetallomicsRow> = {
  omeKey: "metallomics",
  displayName: "Metallomics",
  datasetFilters: [
    { field: "site", label: "Site" },
    { field: "status", label: "Status" },
    { field: "sex", label: "Sex" },
  ],
};

const MetallomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default MetallomicsDownloads;
