"use client";
import { OmeEnum } from "@/common/types/generated/graphql";
import OmeDualPaneDownloads from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { OmeDownloadsConfig } from "@/common/components/Downloads/types";
import { useRNAData } from "@/common/hooks/omeHooks/useRNAData";

type RnaRow = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  kit: string;
};

const config: OmeDownloadsConfig<RnaRow> = {
  ome: OmeEnum.RnaSeq,
  useData: () => useRNAData({ skip: false }),
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const RnaDownloads = () => <OmeDualPaneDownloads config={config} />;

export default RnaDownloads;