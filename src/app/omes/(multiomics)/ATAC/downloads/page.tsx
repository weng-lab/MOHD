"use client";
import { useATACData } from "@/common/hooks/omeHooks/useATACData";
import ATACDownloadsTable from "./ATACDownloadsTable";
import { Protocol, Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";

const ATACDescriptions = [
  "fold change signal",
  "p-value signal",
  "FDR 0.05 peaks",
  "pseudorep peaks",
];

const ATACDownloads = () => {
  const ATACData = useATACData({ skip: false });

  const rows = ATACData.data ?? [];

  return (
    <OmeDownloadLayout
      rows={rows}
      descriptions={ATACDescriptions}
      includeProtocolFilter
      getFilterFields={(row) => ({
        site: row.site as Site,
        status: row.status as Status,
        sex: row.sex as Sex,
        protocol: row.protocol?.replace(" method", "") as Protocol,
      })}
      renderTable={(filteredRows) => (
        <ATACDownloadsTable rows={filteredRows} ATACData={ATACData} />
      )}
    />
  );
};

export default ATACDownloads;