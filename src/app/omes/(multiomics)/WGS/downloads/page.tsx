"use client";
import OmeDualPaneDownloads from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata, OmeDownloadsConfig } from "@/common/components/Downloads/types";

type WGSRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<WGSRow> = {
  omeKey: "wgs",
  displayName: "WGS",
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const WgsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default WgsDownloads;
