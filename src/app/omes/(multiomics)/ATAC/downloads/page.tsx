"use client";
import { useATACData } from "@/common/hooks/omeHooks/useATACData";
import ATACDownloadsTable from "./ATACDownloadsTable";
import { Protocol, Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";
import { useOmeDownloadFiles } from "@/common/hooks/useOmeDownloadFiles";

const ATACDescriptions = [
  "Fold change signal",
  "p-value signal",
  "FDR 0.05 peaks",
  "Pseudorep peaks",
];

const ATACDownloads = () => {
  const ATACData = useATACData({ skip: false });
  const { data: downloadFiles, loading } = useOmeDownloadFiles("ATAC_SEQ");

  const rows = ATACData.data ?? [];

  return (
    <OmeDownloadLayout
      rows={rows}
      downloadFiles={downloadFiles}
      descriptions={ATACDescriptions}
      includeProtocolFilter
      getFilterFields={(row) => ({
        site: row.site as Site,
        status: row.status as Status,
        sex: row.sex as Sex,
        protocol: row.protocol?.replace(" method", "") as Protocol,
      })}
      renderTable={(filteredRows, filteredDownloadFiles) => (
        <ATACDownloadsTable 
          rows={filteredRows}
          ATACData={ATACData} 
          files={filteredDownloadFiles} 
          loadingFiles={loading}
        />
      )}
    />
  );
};

export default ATACDownloads;