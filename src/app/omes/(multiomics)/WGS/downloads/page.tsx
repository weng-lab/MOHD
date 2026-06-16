"use client";
import { OmeEnum } from "@/common/types/generated/graphql";
import OmeDualPaneDownloads from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { OmeDownloadsConfig } from "@/common/components/Downloads/types";
import { useWGSData } from "@/common/hooks/omeHooks/useWGSData";

type WgsRow = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  kit: string;
};

const config: OmeDownloadsConfig<WgsRow> = {
  ome: OmeEnum.Wgs,
  useData: () => useWGSData({ skip: false }),
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const WgsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default WgsDownloads;