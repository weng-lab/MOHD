"use client";
import OmeDualPaneDownloads, {
  type OmeDownloadsConfig,
} from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type MetallomicsRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<MetallomicsRow> = {
  omeKey: "metallomics",
  displayName: "Metallomics",
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const MetallomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default MetallomicsDownloads;