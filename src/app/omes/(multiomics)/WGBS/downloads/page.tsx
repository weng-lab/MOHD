"use client";
import { useRNAData } from "@/common/hooks/omeHooks/useRNAData";
import WGBSDownloadsTable from "./WGBSDownloadsTable";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";

const WGBSDescriptions = [
    "sequenced reads",
    "aligned reads",
    "gene quantifications",
    "isoform quantifications",
    "all signal minus",
    "unique signal minus",
    "all signal plus",
    "unique signal plus"
];

const WGBSDownloads = () => {

    const RNAData = useRNAData({ skip: false });

    const rows = RNAData.data ?? [];

    return (
        <OmeDownloadLayout
            rows={rows}
            descriptions={WGBSDescriptions}
            getFilterFields={(row) => ({
                site: row.site as Site,
                status: row.status as Status,
                sex: row.sex as Sex,
            })}
            renderTable={(filteredRows) => (
                <WGBSDownloadsTable rows={filteredRows} RNAData={RNAData} />
            )}
        />
    )
}

export default WGBSDownloads;