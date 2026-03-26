"use client";
import { TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import { ScatterPlot } from "@mui/icons-material"
import { useMemo } from "react"
import { DownloadPlotHandle } from "@weng-lab/visualization"
import { useRNAData, UseRNADataReturn } from "@/common/hooks/omeHooks/useRNAData";
import RNADimensionalityScatterPlot from "./RNAUMAP"
import RNADimensionalityTable from "./RNADimensionalityTable"
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type RNAMetadata =
    NonNullable<UseRNADataReturn["data"]>;

export type SharedRNADimenionalityProps = {
    rows: RNAMetadata;
    RNAData: UseRNADataReturn;
    selected: RNAMetadata;
    setSelected: React.Dispatch<React.SetStateAction<RNAMetadata>>;
    sortedFilteredData: RNAMetadata;
    tableProps: ReturnType<typeof useTablePlotSync<RNAMetadata[number]>>["tableProps"];
    ref?: React.RefObject<DownloadPlotHandle | null>;
}

const RNADimensionalityReduction = () => {
    const { ref: umapRef, ...umapDownload } = usePlotDownload();
    const RNAData = useRNAData({ skip: false });

    const rows: RNAMetadata = useMemo(() => {
        if (!RNAData.data) return [];
        return RNAData.data;
    }, [RNAData]);

    const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
        rows,
        getRowId: (row) => row.sample_id,
    });

    const SharedRNADimenionalityProps: SharedRNADimenionalityProps = useMemo(
        () => ({
            rows,
            RNAData,
            selected,
            setSelected,
            sortedFilteredData,
            tableProps,
        }),
        [RNAData, rows, selected, setSelected, sortedFilteredData, tableProps]
    );

    return (
        <TwoPaneLayout
            direction={{ xs: "column", lg: "row" }}
            rowHeight="max(60vh, 700px)"
            TableComponent={<RNADimensionalityTable {...SharedRNADimenionalityProps} />}
            plots={[
                {
                    tabTitle: "UMAP",
                    icon: <ScatterPlot />,
                    plotComponent: <RNADimensionalityScatterPlot ref={umapRef} {...SharedRNADimenionalityProps} />,
                    ...umapDownload,
                },
            ]}
        />
    )
}

export default RNADimensionalityReduction;
