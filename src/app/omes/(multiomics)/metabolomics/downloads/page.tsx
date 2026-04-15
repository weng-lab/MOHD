"use client";
import MetabolomicsDownloadsTable from "./MetabolomicsDownloadsTable";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";
import { useOmeDownloadFiles } from "@/common/hooks/useOmeDownloadFiles";
import { useMetabolomicsData } from "@/common/hooks/omeHooks/useMetabolomicsData";
import { OmeEnum } from "@/common/types/generated/graphql";

const MetabolomicsDownloads = () => {

    const MetabolomicsData = useMetabolomicsData({ skip: false });
    const { data: downloadFiles, loading } = useOmeDownloadFiles(OmeEnum.Metabolomics);

    const rows = MetabolomicsData.data ?? [];

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
                <MetabolomicsDownloadsTable 
                    rows={filteredRows} 
                    MetabolomicsData={MetabolomicsData} 
                    files={filteredDownloadFiles}
                    loadingFiles={loading}
                />
            )}
        />
    )
}

export default MetabolomicsDownloads;