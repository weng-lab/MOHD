"use client";
import { useMemo } from "react"
import { useRNAData, UseRNADataReturn } from "@/common/hooks/omeHooks/useRNAData";
import RNADownloadsTable from "./RNADownloadsTable";

export type RNAMetadata =
    NonNullable<UseRNADataReturn["data"]>;

export type RNADownloadsProps = {
    rows: RNAMetadata;
    RNAData: UseRNADataReturn;
}

const RNADownloads = () => {

    const RNAData = useRNAData({ skip: false });

    const rows: RNAMetadata = useMemo(() => {
        if (!RNAData.data) return [];
        return RNAData.data;
    }, [RNAData]);

    const SharedRNADownloadsProps: RNADownloadsProps = useMemo(
        () => ({
            rows,
            RNAData,
        }),
        [RNAData, rows]
    );

    return (
        <RNADownloadsTable {...SharedRNADownloadsProps} />
    )
}

export default RNADownloads;