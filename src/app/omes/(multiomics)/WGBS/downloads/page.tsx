"use client";
import OmeDualPaneDownloads, { type OmeDownloadsConfig } from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type WGBSRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<WGBSRow> = {
  omeKey: "wgbs",
  displayName: "WGBS",
  datasetFilters: [
    { field: "site", label: "Site" },
    { field: "status", label: "Status" },
    { field: "sex", label: "Sex" },
  ],
};

const WGBSDownloads = () => <OmeDualPaneDownloads config={config} />;

export default WGBSDownloads;
