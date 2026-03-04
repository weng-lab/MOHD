"use client";
import { useMemo, useState } from "react"
import { useRNAData, UseRNADataReturn } from "@/common/hooks/omeHooks/useRNAData";
import WGSDownloadsTable from "./WGSDownloadsTable";
import { Stack } from "@mui/system";
import { Sex, Site, Status } from "@/common/types/globalTypes";
import OmeDownloadsControls from "@/common/components/OmeDownloadsControls";

export type RNAMetadata =
    NonNullable<UseRNADataReturn["data"]>;

export type WGSDownloadsProps = {
    rows: RNAMetadata;
    RNAData: UseRNADataReturn;
    site: Site[];
    status: Status[];
    sex: Sex[];
}

const WGSDownloads = () => {
    const [site, setSite] = useState<Site[]>(["CCH", "CKD", "EXP", "MOM", "UIC"]);
    const [status, setStatus] = useState<Status[]>(["case", "control", "unknown"]);
    const [sex, setSex] = useState<Sex[]>(["male", "female"]);

    const RNAData = useRNAData({ skip: false });

    const rows: RNAMetadata = useMemo(() => {
        if (!RNAData.data) return [];

        return RNAData.data.filter((row) =>
            site.includes(row.site as Site) &&
            status.includes(row.status as Status) &&
            sex.includes(row.sex as Sex)
        );
    }, [RNAData.data, site, status, sex]);

    const SharedWGSDownloadsProps: WGSDownloadsProps = useMemo(
        () => ({
            rows,
            RNAData,
            site,
            status,
            sex,
        }),
        [RNAData, rows, sex, site, status]
    );

    return (
        <Stack direction="column" spacing={2}>
            <OmeDownloadsControls 
                site={site} 
                status={status} 
                sex={sex} 
                setSite={setSite} 
                setStatus={setStatus} 
                setSex={setSex} 
            />
            <WGSDownloadsTable {...SharedWGSDownloadsProps} />
        </Stack>
    )
}

export default WGSDownloads;