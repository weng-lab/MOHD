"use client";
import { OmeEnum } from "@/common/types/generated/graphql";
import OmeDualPaneDownloads from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { OmeDownloadsConfig } from "@/common/components/Downloads/types";
import { useExposomicsData } from "@/common/hooks/omeHooks/useExposomicsData";

type ExposomicsRow = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  kit: string;
};

const config: OmeDownloadsConfig<ExposomicsRow> = {
  ome: OmeEnum.Exposomics,
  useData: () => useExposomicsData({ skip: false }),
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const ExposomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default ExposomicsDownloads;