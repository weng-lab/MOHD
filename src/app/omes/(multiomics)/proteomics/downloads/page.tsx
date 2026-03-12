"use client";
import ProteomicsDownloadsTable from "./ProteomicsDownloadsTable";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";
import { useOmeDownloadFiles } from "@/common/hooks/useOmeDownloadFiles";
import { useProteomicsData } from "@/common/hooks/omeHooks/useProteomicsData";

const ProteomicsDownloads = () => {

    const ProteomicsData = useProteomicsData({ skip: false });
    const { data: downloadFiles, loading } = useOmeDownloadFiles("PROTEOMICS");

    const rows = ProteomicsData.data ?? [];

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
                <ProteomicsDownloadsTable 
                    rows={filteredRows} 
                    ProteomicsData={ProteomicsData} 
                    files={filteredDownloadFiles}
                    loadingFiles={loading}
                />
            )}
        />
    )
}

export default ProteomicsDownloads;