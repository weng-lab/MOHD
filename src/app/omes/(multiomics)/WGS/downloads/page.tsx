"use client";
import { useRNAData } from "@/common/hooks/omeHooks/useRNAData";
import WGSDownloadsTable from "./WGSDownloadsTable";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";

const WGSDescriptions = [
    "sequenced reads",
    "aligned reads",
    "gene quantifications",
    "isoform quantifications",
    "all signal minus",
    "unique signal minus",
    "all signal plus",
    "unique signal plus"
];

const WGSDownloads = () => {

    const RNAData = useRNAData({ skip: false });

    const rows = RNAData.data ?? [];

    return (
        <OmeDownloadLayout
            rows={rows}
            descriptions={WGSDescriptions}
            getFilterFields={(row) => ({
                site: row.site as Site,
                status: row.status as Status,
                sex: row.sex as Sex,
            })}
            renderTable={(filteredRows) => (
                <WGSDownloadsTable rows={filteredRows} RNAData={RNAData} />
            )}
        />
    )
}

export default WGSDownloads;