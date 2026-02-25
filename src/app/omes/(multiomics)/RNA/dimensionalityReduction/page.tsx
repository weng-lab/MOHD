"use client";
import TwoPaneLayout from "@/common/components/OmeDetails/TwoPaneLayout"
import { ScatterPlot } from "@mui/icons-material"
import { useMemo, useRef, useState } from "react"
import { DownloadPlotHandle } from "@weng-lab/visualization"
import { useRNAData, UseRNADataReturn } from "@/common/hooks/omeHooks/useRNAData";
import RNADimensionalityScatterPlot from "./RNAUMAP"
import RNADimensionalityTable from "./RNADimensionalityTable"

export type RNAMetadata =
    NonNullable<UseRNADataReturn["data"]>;

export type SharedRNADimenionalityProps = {
    rows: RNAMetadata;
    RNAData: UseRNADataReturn;
    selected: RNAMetadata;
    setSelected: (selected: RNAMetadata) => void;
    sortedFilteredData: RNAMetadata;
    setSortedFilteredData: (data: RNAMetadata) => void;
    ref?: React.RefObject<DownloadPlotHandle | null>;
}

const RNADimensionalityReduction = () => {
    const [selected, setSelected] = useState<RNAMetadata>([]);
    const [sortedFilteredData, setSortedFilteredData] = useState<RNAMetadata>([]);

    const scatterRef = useRef<DownloadPlotHandle | null>(null);
    const RNAData = useRNAData({ skip: false });

    const rows: RNAMetadata = useMemo(() => {
        if (!RNAData.data) return [];
        return RNAData.data;
    }, [RNAData]);

    const SharedRNADimenionalityProps: SharedRNADimenionalityProps = useMemo(
        () => ({
            rows,
            RNAData,
            selected,
            setSelected,
            sortedFilteredData,
            setSortedFilteredData,
        }),
        [RNAData, rows, selected, sortedFilteredData]
    );

    return (
        <TwoPaneLayout
            TableComponent={<RNADimensionalityTable {...SharedRNADimenionalityProps} />}
            plots={[
                {
                    tabTitle: "UMAP",
                    icon: <ScatterPlot />,
                    plotComponent: <RNADimensionalityScatterPlot ref={scatterRef} {...SharedRNADimenionalityProps} />,
                    plotRef: scatterRef,
                },
            ]}
        />
    )
}

export default RNADimensionalityReduction;