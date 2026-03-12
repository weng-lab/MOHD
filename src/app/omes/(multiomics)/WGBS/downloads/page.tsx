"use client";
import { useWGBSData } from "@/common/hooks/omeHooks/useWGBSData";
import WGBSDownloadsTable from "./WGBSDownloadsTable";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";
import { useOmeDownloadFiles } from "@/common/hooks/useOmeDownloadFiles";

const WGBSDescriptions = [
    "Cytosine-level DNA methylation measurements",
    "Pileup Signal Minus",
    "Pileup Signal Plus",
    "Methylation Estimation Signal Minus CHG Context",
    "Methylation Estimation Signal Plus CHG Context",
    "Methylation Estimation Signal Minus CHH Context",
    "Methylation Estimation Signal Plus CHH Context",
    "Methylation Estimation Signal Minus CpG Context",
    "Methylation Estimation Signal Plus CpG Context",
];

const WGBSDownloads = () => {

    const WGBSData = useWGBSData({ skip: false });
    const { data: downloadFiles, loading } = useOmeDownloadFiles("WGBS");

    const rows = WGBSData.data ?? [];

    return (
        <OmeDownloadLayout
            rows={rows}
            downloadFiles={downloadFiles}
            descriptions={WGBSDescriptions}
            getFilterFields={(row) => ({
                site: row.site as Site,
                status: row.status as Status,
                sex: row.sex as Sex,
            })}
            renderTable={(filteredRows, filteredDownloadFiles) => (
                <WGBSDownloadsTable 
                    rows={filteredRows} 
                    WGBSData={WGBSData} 
                    files={filteredDownloadFiles} 
                    loadingFiles={loading} 
                />
            )}
        />
    )
}

export default WGBSDownloads;