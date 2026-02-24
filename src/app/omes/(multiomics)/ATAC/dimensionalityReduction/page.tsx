"use client";
import TwoPaneLayout from "@/common/components/OmeDetails/TwoPaneLayout"
import ATACDimensionalityTable from "./ATACDimensionalityTable"
import { ScatterPlot } from "@mui/icons-material"
import ATACDimensionalityScatterPlot from "./ATACUMAP"
import { useMemo, useRef, useState } from "react"
import { DownloadPlotHandle } from "@weng-lab/visualization"
import { useATACData, UseATACDataReturn } from "@/common/hooks/omeHooks/useATACData";

export type ATACMetadata =
    NonNullable<UseATACDataReturn["data"]>;

export type SharedATACDimenionalityProps = {
    rows: ATACMetadata;
    ATACData: UseATACDataReturn;
    selected: ATACMetadata;
    setSelected: (selected: ATACMetadata) => void;
    sortedFilteredData: ATACMetadata;
    setSortedFilteredData: (data: ATACMetadata) => void;
    ref?: React.RefObject<DownloadPlotHandle | null>;
}

const ATACDimensionalityReduction = () => {
    const [selected, setSelected] = useState<ATACMetadata>([]);
    const [sortedFilteredData, setSortedFilteredData] = useState<ATACMetadata>([]);

    const scatterRef = useRef<DownloadPlotHandle | null>(null);
    const ATACData = useATACData({ skip: false });

    const rows: ATACMetadata = useMemo(() => {
        if (!ATACData.data) return [];
        return ATACData.data;
    }, [ATACData]);

    const SharedATACDimenionalityProps: SharedATACDimenionalityProps = useMemo(
        () => ({
            rows,
            ATACData,
            selected,
            setSelected,
            sortedFilteredData,
            setSortedFilteredData,
        }),
        [ATACData, rows, selected, sortedFilteredData]
    );

    return (
        <TwoPaneLayout
            TableComponent={<ATACDimensionalityTable {...SharedATACDimenionalityProps} />}
            plots={[
                {
                    tabTitle: "UMAP",
                    icon: <ScatterPlot />,
                    plotComponent: <ATACDimensionalityScatterPlot ref={scatterRef} {...SharedATACDimenionalityProps} />,
                    plotRef: scatterRef,
                },
            ]}
        />
    )
}

export default ATACDimensionalityReduction;