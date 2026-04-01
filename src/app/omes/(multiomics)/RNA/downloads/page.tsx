"use client";
import { useRNAData } from "@/common/hooks/omeHooks/useRNAData";
import RNADownloadsTable from "./RNADownloadsTable";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";
import { useOmeDownloadFiles } from "@/common/hooks/useOmeDownloadFiles";
import { OmeEnum } from "@/common/types/generated/graphql";

const RNADescriptions = [
    "Gene quantifications",
    "Isoform quantifications",
    "All Signal Minus",
    "Unique Signal Minus",
    "All Signal Plus",
    "Unique Signal Plus"
];

const RNADownloads = () => {

    const RNAData = useRNAData({ skip: false });
    const { data: downloadFiles, loading } = useOmeDownloadFiles(OmeEnum.RnaSeq);

    const rows = RNAData.data ?? [];

    return (
        <OmeDownloadLayout
            rows={rows}
            downloadFiles={downloadFiles}
            descriptions={RNADescriptions}
            getFilterFields={(row) => ({
                site: row.site as Site,
                status: row.status as Status,
                sex: row.sex as Sex,
            })}
            renderTable={(filteredRows, filteredDownloadFiles) => (
                <RNADownloadsTable 
                    rows={filteredRows} 
                    RNAData={RNAData} 
                    files={filteredDownloadFiles}
                    loadingFiles={loading}
                />
            )}
        />
    )
}

export default RNADownloads;