"use client";
import { TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import LipidomicsQuantificationTable from "./LipidomicsQuantificationTable"
import { GridOn } from "@mui/icons-material"
import LipidomicsQuantificationHeatmap from "./LipidomicsQuantificationHeatmap"
import { useMemo, useState } from "react"
import { DownloadPlotHandle } from "@weng-lab/visualization";
import { useLipidomicsData, UseLipidomicsDataReturn, LipidomicsSample } from "@/common/hooks/omeHooks/useLipidomicsData";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type LipidomicsMetadata = LipidomicsSample[];

export type SharedLipidomicsProps = {
    rows: LipidomicsMetadata;
    lipidomicsData: UseLipidomicsDataReturn;
    selected: LipidomicsMetadata;
    setSelected: React.Dispatch<React.SetStateAction<LipidomicsMetadata>>;
    sortedFilteredData: LipidomicsMetadata;
    tableProps: ReturnType<typeof useTablePlotSync<LipidomicsSample>>["tableProps"];
    autoSort: boolean;
    setAutoSort: React.Dispatch<React.SetStateAction<boolean>>;
    ref?: React.RefObject<DownloadPlotHandle | null>;
}

const LipidomicsHeatmap = () => {
    const { ref: heatmapRef, ...heatmapDownload } = usePlotDownload();
    const lipidomicsData = useLipidomicsData({ skip: false });

    const rows: LipidomicsMetadata = useMemo(() => {
        if (!lipidomicsData.data) return [];
        return lipidomicsData.data;
    }, [lipidomicsData]);

    const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
        rows,
        getRowId: (row) => row.sample_id,
    });
    const [autoSort, setAutoSort] = useState(false);

    const SharedLipidomicsProps: SharedLipidomicsProps = useMemo(
        () => ({
            rows,
            lipidomicsData,
            selected,
            setSelected,
            sortedFilteredData,
            tableProps,
            autoSort,
            setAutoSort,
        }),
        [lipidomicsData, rows, selected, setSelected, sortedFilteredData, tableProps, autoSort]
    );

    return (
        <TwoPaneLayout
            direction={{ xs: "column", lg: "row" }}
            rowHeight="max(60vh, 700px)"
            TableComponent={<LipidomicsQuantificationTable {...SharedLipidomicsProps} />}
            plots={[
                {
                    tabTitle: "Heatmap",
                    icon: <GridOn />,
                    plotComponent: <LipidomicsQuantificationHeatmap ref={heatmapRef} {...SharedLipidomicsProps} />,
                    ...heatmapDownload,
                },
            ]}
        />
    )
}

export default LipidomicsHeatmap;
