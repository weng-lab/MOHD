"use client";
import { useRNAData } from "@/common/hooks/omeHooks/useRNAData";
import WGBSDownloadsTable from "./WGBSDownloadsTable";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadLayout from "@/common/components/Downloads/OmeDownloadLayout";

const WGBSDescriptions = [
    "cytosine-level DNA methylation measurements",
    "pileup signal minus",
    "pileup signal plus",
    "methylation estimation signal minus CHG context",
    "methylation estimation signal plus CHG context",
    "methylation estimation signal minus CHH context",
    "methylation estimation signal plus CHH context",
    "methylation estimation signal minus CpG context",
    "methylation estimation signal plus CpG context",
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