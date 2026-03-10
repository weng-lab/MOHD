"use client";
import { useRNAData } from "@/common/hooks/omeHooks/useRNAData";
import MetabolomicsDownloadsTable from "./MetabolomicsDownloadsTable";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";

const MetabolomicsDescriptions = [
    "sequenced reads",
    "aligned reads",
    "gene quantifications",
    "isoform quantifications",
    "all signal minus",
    "unique signal minus",
    "all signal plus",
    "unique signal plus"
];

const MetabolomicsDownloads = () => {

    const RNAData = useRNAData({ skip: false });

    const rows = RNAData.data ?? [];

    return (
        <OmeDownloadLayout
            rows={rows}
            descriptions={MetabolomicsDescriptions}
            getFilterFields={(row) => ({
                site: row.site as Site,
                status: row.status as Status,
                sex: row.sex as Sex,
            })}
            renderTable={(filteredRows) => (
                <MetabolomicsDownloadsTable rows={filteredRows} RNAData={RNAData} />
            )}
        />
    )
}

export default MetabolomicsDownloads;