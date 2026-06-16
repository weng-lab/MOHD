"use client";
import { OmeEnum } from "@/common/types/generated/graphql";
import OmeDualPaneDownloads from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { OmeDownloadsConfig } from "@/common/components/Downloads/types";
import { useMetabolomicsData } from "@/common/hooks/omeHooks/useMetabolomicsData";

type MetabolomicsRow = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  kit: string;
};

const config: OmeDownloadsConfig<MetabolomicsRow> = {
  ome: OmeEnum.Metabolomics,
  useData: () => useMetabolomicsData({ skip: false }),
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const MetabolomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default MetabolomicsDownloads;