"use client";
import OmeDualPaneDownloads, {
  type OmeDownloadsConfig,
} from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type WGSRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<WGSRow> = {
  omeKey: "wgs",
  displayName: "WGS",
  noOpenAccess: true,
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const WgsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default WgsDownloads;
