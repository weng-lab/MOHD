"use client";
import OmeDualPaneDownloads, { type OmeDownloadsConfig } from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type WGSRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<WGSRow> = {
  omeKey: "wgs",
  displayName: "WGS",
  noOpenAccess: true,
  datasetFilters: [
    { field: "site", label: "Site" },
    { field: "status", label: "Status" },
    { field: "sex", label: "Sex" },
  ],
};

const WgsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default WgsDownloads;
