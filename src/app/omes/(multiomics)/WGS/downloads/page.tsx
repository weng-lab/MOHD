"use client";
import WGSDownloadsTable from "./WGSDownloadsTable";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";
import { useWGSData } from "@/common/hooks/omeHooks/useWGSData";
import { useOmeDownloadFiles } from "@/common/hooks/useOmeDownloadFiles";

const WGSDownloads = () => {

    const WGSData = useWGSData({ skip: false });
    const { data: downloadFiles, loading } = useOmeDownloadFiles("WGS");
    console.log(downloadFiles)

    const rows = WGSData.data ?? [];

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
                <WGSDownloadsTable
                    rows={filteredRows}
                    WGSData={WGSData}
                    files={filteredDownloadFiles}
                    loadingFiles={loading}
                />
            )}
        />
    )
}

export default WGSDownloads;