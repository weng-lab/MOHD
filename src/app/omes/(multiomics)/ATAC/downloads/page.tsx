"use client";
import { useATACData } from "@/common/hooks/omeHooks/useATACData";
import { OmeEnum } from "@/common/types/generated/graphql";
import OmeDualPaneDownloads from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { OmeDownloadsConfig } from "@/common/components/Downloads/types";

type ATACRow = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  protocol: string;
  opc_id: string;
};

const config: OmeDownloadsConfig<ATACRow> = {
  ome: OmeEnum.AtacSeq,
  useData: () => useATACData({ skip: false }),
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "protocol", label: "Protocol" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const ATACDownloads = () => <OmeDualPaneDownloads config={config} />;

export default ATACDownloads;
