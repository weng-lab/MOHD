"use client";
import OmeDualPaneDownloads, { type OmeDownloadsConfig } from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type MetabolomicsRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<MetabolomicsRow> = {
  omeKey: "metabolomics",
  displayName: "Metabolomics",
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const MetabolomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default MetabolomicsDownloads;
