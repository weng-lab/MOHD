"use client";
import OmeDualPaneDownloads, {
  type OmeDownloadsConfig,
} from "@/common/components/Downloads/OmeDualPaneDownloads";
import type { BaseSampleMetadata } from "@/common/components/Downloads/types";

type LipidomicsRow = BaseSampleMetadata;

const config: OmeDownloadsConfig<LipidomicsRow> = {
  omeKey: "lipidomics",
  displayName: "Lipidomics",
  datasetFilters: [
    { field: "sex", label: "Sex" },
    { field: "status", label: "Status" },
    { field: "site", label: "Site" },
  ],
};

const LipidomicsDownloads = () => <OmeDualPaneDownloads config={config} />;

export default LipidomicsDownloads;
