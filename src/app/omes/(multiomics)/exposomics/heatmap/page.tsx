"use client";
import { TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import ExposomicsQuantificationTable from "./ExposomicsQuantificationTable"
import { GridOn } from "@mui/icons-material"
import ExposomicsQuantificationHeatmap from "./ExposomicsQuantificationHeatmap"
import { useMemo, useState } from "react"
import { DownloadPlotHandle } from "@weng-lab/visualization";
import { useExposomicsData, UseExposomicsDataReturn, ExposomicsSample } from "@/common/hooks/omeHooks/useExposomicsData";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type ExposomicsMetadata = ExposomicsSample[];

export type SharedExposomicsProps = {
    rows: ExposomicsMetadata;
    exposomicsData: UseExposomicsDataReturn;
    selected: ExposomicsMetadata;
    setSelected: React.Dispatch<React.SetStateAction<ExposomicsMetadata>>;
    sortedFilteredData: ExposomicsMetadata;
    tableProps: ReturnType<typeof useTablePlotSync<ExposomicsSample>>["tableProps"];
    autoSort: boolean;
    setAutoSort: React.Dispatch<React.SetStateAction<boolean>>;
    ref?: React.RefObject<DownloadPlotHandle | null>;
}

const ExposomicsHeatmap = () => {
    const { ref: heatmapRef, ...heatmapDownload } = usePlotDownload();
    const exposomicsData = useExposomicsData({ skip: false });

    const rows: ExposomicsMetadata = useMemo(() => {
        if (!exposomicsData.data) return [];
        return exposomicsData.data;
    }, [exposomicsData]);

    const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
        rows,
        getRowId: (row) => row.sample_id,
    });
    const [autoSort, setAutoSort] = useState(false);

    const SharedExposomicsProps: SharedExposomicsProps = useMemo(
        () => ({
            rows,
            exposomicsData,
            selected,
            setSelected,
            sortedFilteredData,
            tableProps,
            autoSort,
            setAutoSort,
        }),
        [exposomicsData, rows, selected, setSelected, sortedFilteredData, tableProps, autoSort]
    );

    return (
        <TwoPaneLayout
            direction={{ xs: "column", lg: "row" }}
            rowHeight="max(60vh, 700px)"
            TableComponent={<ExposomicsQuantificationTable {...SharedExposomicsProps} />}
            plots={[
                {
                    tabTitle: "Heatmap",
                    icon: <GridOn />,
                    plotComponent: <ExposomicsQuantificationHeatmap ref={heatmapRef} {...SharedExposomicsProps} />,
                    ...heatmapDownload,
                },
            ]}
        />
    )
}

export default ExposomicsHeatmap;
