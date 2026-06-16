"use client";
import { OmeEnum } from "@/common/types/generated/graphql";
import OmeDualPaneDownloads from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { OmeDownloadsConfig } from "@/common/components/Downloads/types";
import { useLipidomicsData } from "@/common/hooks/omeHooks/useLipidomicsData";

type LipidomicsRow = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  kit: string;
};

const config: OmeDownloadsConfig<LipidomicsRow> = {
  ome: OmeEnum.Lipidomics,
  useData: () => useLipidomicsData({ skip: false }),
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const LipidomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default LipidomicsDownloads;