"use client";
import { useMemo } from "react"
import { useATACData, UseATACDataReturn } from "@/common/hooks/omeHooks/useATACData";
import ATACDownloadsTable from "./ATACDownloadsTable";

export type ATACMetadata =
    NonNullable<UseATACDataReturn["data"]>;

export type ATACDownloadsProps = {
    rows: ATACMetadata;
    ATACData: UseATACDataReturn;
}

const ATACDownloads = () => {

    const ATACData = useATACData({ skip: false });

    const rows: ATACMetadata = useMemo(() => {
        if (!ATACData.data) return [];
        return ATACData.data;
    }, [ATACData]);

    const SharedATACDownloadsProps: ATACDownloadsProps = useMemo(
        () => ({
            rows,
            ATACData,
        }),
        [ATACData, rows]
    );

    return (
        <ATACDownloadsTable {...SharedATACDownloadsProps} />
    )
}

export default ATACDownloads;