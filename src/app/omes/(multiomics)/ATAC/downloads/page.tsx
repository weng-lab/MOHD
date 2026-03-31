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
    { field: "sex", label: "Sex", type: "checkbox" },
    { field: "status", label: "Status", type: "checkbox" },
    { field: "protocol", label: "Protocol", type: "checkbox" },
    { field: "site", label: "Site", type: "multiselect" },
  ],
};

const ATACDownloads = () => <OmeDualPaneDownloads config={config} />;

export default ATACDownloads;
