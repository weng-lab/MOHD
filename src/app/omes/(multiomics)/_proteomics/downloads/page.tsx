"use client";
import OmeDualPaneDownloads, { type OmeDownloadsConfig } from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type ProteomicsRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<ProteomicsRow> = {
  omeKey: "proteomics",
  displayName: "Proteomics",
  noOpenAccess: true,
  datasetFilters: [
    { field: "site", label: "Site" },
    { field: "status", label: "Status" },
    { field: "sex", label: "Sex" },
  ],
};

const ProteomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default ProteomicsDownloads;
