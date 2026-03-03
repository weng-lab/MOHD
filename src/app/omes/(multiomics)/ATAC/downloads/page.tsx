"use client";
import { useMemo, useState } from "react"
import { useATACData, UseATACDataReturn } from "@/common/hooks/omeHooks/useATACData";
import ATACDownloadsTable from "./ATACDownloadsTable";
import { Site, Status, Sex, Protocol } from "@/common/types/globalTypes";
import OmeDownloadsControls from "@/common/components/OmeDownloadsControls";
import { Stack } from "@mui/system";

export type ATACMetadata =
    NonNullable<UseATACDataReturn["data"]>;

export type ATACDownloadsProps = {
    rows: ATACMetadata;
    ATACData: UseATACDataReturn;
}

const ATACDownloads = () => {
    const [site, setSite] = useState<Site[]>(["CCH", "CKD", "EXP", "MOM", "UIC"]);
    const [status, setStatus] = useState<Status[]>(["case", "control", "unknown"]);
    const [sex, setSex] = useState<Sex[]>(["male", "female"]);
    const [protocol, setProtocol] = useState<Protocol[]>(["Buffy Coat", "OPC", "CPT"]);

    const ATACData = useATACData({ skip: false });

    console.log("ATACData:", ATACData.data);

    const rows: ATACMetadata = useMemo(() => {
        if (!ATACData.data) return [];
        return ATACData.data.filter((row) =>
            site.includes(row.site as Site) &&
            status.includes(row.status as Status) &&
            sex.includes(row.sex as Sex) &&
            protocol.includes(row.protocol.replace(" method", "") as Protocol)
        );
    }, [ATACData.data, protocol, sex, site, status]);

    const SharedATACDownloadsProps: ATACDownloadsProps = useMemo(
        () => ({
            rows,
            ATACData,
        }),
        [ATACData, rows]
    );

    return (
        <Stack direction="column" spacing={2}>
            <OmeDownloadsControls
                site={site}
                status={status}
                sex={sex}
                protocol={protocol}
                setSite={setSite}
                setStatus={setStatus}
                setSex={setSex}
                setProtocol={setProtocol}
            />
            <ATACDownloadsTable {...SharedATACDownloadsProps} />
        </Stack>
    )
}

export default ATACDownloads;