"use client";
import { useExposomicsData } from "@/common/hooks/omeHooks/useExposomicsData";
import ExposomicsDownloadsTable from "./ExposomicsDownloadsTable";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";
import { useOmeDownloadFiles } from "@/common/hooks/useOmeDownloadFiles";

const ExposomicsDownloads = () => {

    const exposomicsData = useExposomicsData({ skip: false });
    const { data: downloadFiles, loading } = useOmeDownloadFiles("EXPOSOMICS");

    const rows = exposomicsData.data ?? [];

    return (
        <OmeDownloadLayout
            rows={rows}
            downloadFiles={downloadFiles}
            getFilterFields={(row) => ({
                site: row.site as Site,
                status: row.status as Status,
                sex: row.sex as Sex,
            })}
            renderTable={(filteredRows, filteredDownloadFiles) => (
                <ExposomicsDownloadsTable 
                    rows={filteredRows} 
                    ExposomicsData={exposomicsData} 
                    files={filteredDownloadFiles}
                    loadingFiles={loading}
                />
            )}
        />
    )
}

export default ExposomicsDownloads;