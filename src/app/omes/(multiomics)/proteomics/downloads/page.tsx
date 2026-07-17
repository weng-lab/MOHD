"use client";
import OmeDualPaneDownloads from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata, OmeDownloadsConfig } from "@/common/components/Downloads/types";

type ProteomicsRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<ProteomicsRow> = {
  omeKey: "proteomics",
  displayName: "Proteomics",
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const ProteomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default ProteomicsDownloads;
