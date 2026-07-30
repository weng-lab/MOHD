"use client";
import OmeDualPaneDownloads, {
  type OmeDownloadsConfig,
} from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type ExposomicsRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<ExposomicsRow> = {
  omeKey: "exposomics",
  displayName: "Exposomics",
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const ExposomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default ExposomicsDownloads;
