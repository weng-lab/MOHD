"use client";
import OmeDualPaneDownloads, {
  type OmeDownloadsConfig,
} from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type ProteomicsRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<ProteomicsRow> = {
  omeKey: "proteomics",
  displayName: "Proteomics",
  noOpenAccess: true,
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const ProteomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default ProteomicsDownloads;
