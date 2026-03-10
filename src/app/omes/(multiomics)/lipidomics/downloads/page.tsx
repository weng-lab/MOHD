"use client";
import { useRNAData } from "@/common/hooks/omeHooks/useRNAData";
import LipidomicsDownloadsTable from "./LipidomicsDownloadsTable";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";

const LipidomicsDescriptions = [
    "sequenced reads",
    "aligned reads",
    "gene quantifications",
    "isoform quantifications",
    "all signal minus",
    "unique signal minus",
    "all signal plus",
    "unique signal plus"
];

const LipidomicsDownloads = () => {

    const RNAData = useRNAData({ skip: false });

    const rows = RNAData.data ?? [];

    return (
        <OmeDownloadLayout
            rows={rows}
            descriptions={LipidomicsDescriptions}
            getFilterFields={(row) => ({
                site: row.site as Site,
                status: row.status as Status,
                sex: row.sex as Sex,
            })}
            renderTable={(filteredRows) => (
                <LipidomicsDownloadsTable rows={filteredRows} RNAData={RNAData} />
            )}
        />
    )
}

export default LipidomicsDownloads;