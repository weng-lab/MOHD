"use client";
import { OmeEnum } from "@/common/types/generated/graphql";
import OmeDualPaneDownloads from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { OmeDownloadsConfig } from "@/common/components/Downloads/types";
import { useProteomicsData } from "@/common/hooks/omeHooks/useProteomicsData";

type ProteomicsRow = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  kit: string;
};

const config: OmeDownloadsConfig<ProteomicsRow> = {
  ome: OmeEnum.Proteomics,
  useData: () => useProteomicsData({ skip: false }),
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const ProteomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default ProteomicsDownloads;