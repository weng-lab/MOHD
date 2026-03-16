"use client";
import LipidomicsDownloadsTable from "./LipidomicsDownloadsTable";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";
import { useOmeDownloadFiles } from "@/common/hooks/useOmeDownloadFiles";
import { useLipidomicsData } from "@/common/hooks/omeHooks/useLipidomicsData";

const LipidomicsDownloads = () => {

    const lipidomicsData = useLipidomicsData({ skip: false });
    const { data: downloadFiles, loading } = useOmeDownloadFiles("LIPIDOMICS");

    const rows = lipidomicsData.data ?? [];

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
                <LipidomicsDownloadsTable 
                    rows={filteredRows} 
                    LipidomicsData={lipidomicsData} 
                    files={filteredDownloadFiles} 
                    loadingFiles={loading}
                />
            )}
        />
    )
}

export default LipidomicsDownloads;