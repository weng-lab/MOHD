"use client";
import OmeDualPaneDownloads, { type OmeDownloadsConfig } from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type MetabolomicsRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<MetabolomicsRow> = {
  omeKey: "metabolomics",
  displayName: "Metabolomics",
  datasetFilters: [
    { field: "site", label: "Site" },
    { field: "status", label: "Status" },
    { field: "sex", label: "Sex" },
  ],
};

const MetabolomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default MetabolomicsDownloads;
