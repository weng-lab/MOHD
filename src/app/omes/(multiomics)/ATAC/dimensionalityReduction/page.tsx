"use client";
import { TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import ATACDimensionalityTable from "./ATACDimensionalityTable"
import { ScatterPlot } from "@mui/icons-material"
import ATACDimensionalityScatterPlot from "./ATACUMAP"
import { useMemo } from "react"
import { DownloadPlotHandle } from "@weng-lab/visualization"
import { useATACData, UseATACDataReturn } from "@/common/hooks/omeHooks/useATACData";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type ATACMetadata =
    NonNullable<UseATACDataReturn["data"]>;

export type SharedATACDimenionalityProps = {
    rows: ATACMetadata;
    ATACData: UseATACDataReturn;
    selected: ATACMetadata;
    setSelected: React.Dispatch<React.SetStateAction<ATACMetadata>>;
    sortedFilteredData: ATACMetadata;
    tableProps: ReturnType<typeof useTablePlotSync<ATACMetadata[number]>>["tableProps"];
    ref?: React.RefObject<DownloadPlotHandle | null>;
}

const ATACDimensionalityReduction = () => {
    const { ref: umapRef, ...umapDownload } = usePlotDownload();
    const ATACData = useATACData({ skip: false });

    const rows: ATACMetadata = useMemo(() => {
        if (!ATACData.data) return [];
        return ATACData.data;
    }, [ATACData]);

    const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
        rows,
        getRowId: (row) => row.sample_id,
    });

    const SharedATACDimenionalityProps: SharedATACDimenionalityProps = useMemo(
        () => ({
            rows,
            ATACData,
            selected,
            setSelected,
            sortedFilteredData,
            tableProps,
        }),
        [ATACData, rows, selected, setSelected, sortedFilteredData, tableProps]
    );

    return (
        <TwoPaneLayout
            direction={{ xs: "column", lg: "row" }}
            rowHeight="max(60vh, 700px)"
            TableComponent={<ATACDimensionalityTable {...SharedATACDimenionalityProps} />}
            plots={[
                {
                    tabTitle: "UMAP",
                    icon: <ScatterPlot />,
                    plotComponent: <ATACDimensionalityScatterPlot ref={umapRef} {...SharedATACDimenionalityProps} />,
                    ...umapDownload,
                },
            ]}
        />
    )
}

export default ATACDimensionalityReduction;
