"use client";
import OmeDualPaneDownloads, { type OmeDownloadsConfig } from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type ExposomicsRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<ExposomicsRow> = {
  omeKey: "exposomics",
  displayName: "Exposomics",
  noOpenAccess: true,
  datasetFilters: [
    { field: "site", label: "Site" },
    { field: "status", label: "Status" },
    { field: "sex", label: "Sex" },
  ],
};

const ExposomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default ExposomicsDownloads;
