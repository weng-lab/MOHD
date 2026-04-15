"use client";
import { useWGBSData } from "@/common/hooks/omeHooks/useWGBSData";
import { OmeEnum } from "@/common/types/generated/graphql";
import OmeDualPaneDownloads from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { OmeDownloadsConfig } from "@/common/components/Downloads/types";

type WGBSRow = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  kit: string;
};

const config: OmeDownloadsConfig<WGBSRow> = {
  ome: OmeEnum.Wgbs,
  useData: () => useWGBSData({ skip: false }),
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const WGBSDownloads = () => <OmeDualPaneDownloads config={config} />;

export default WGBSDownloads;
