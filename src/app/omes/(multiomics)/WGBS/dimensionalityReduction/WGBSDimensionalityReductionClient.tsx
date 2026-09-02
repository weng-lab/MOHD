"use client";
import { TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import WGBSDimensionalityTable from "./WGBSDimensionalityTable"
import { ScatterPlot } from "@mui/icons-material"
import WGBSDimensionalityScatterPlot from "./WGBSUMAP"
import WGBSDimensionalityPCAPlot from "./WGBSPCA"
import { useMemo } from "react"
import { DownloadPlotHandle } from "@weng-lab/visualization"
import usePlotDownload from "@/common/hooks/usePlotDownload";
import type { WGBSRow } from "./types";

export type SharedWGBSDimenionalityProps = {
    rows: WGBSRow[];
    selected: WGBSRow[];
    setSelected: React.Dispatch<React.SetStateAction<WGBSRow[]>>;
    sortedFilteredData: WGBSRow[];
    tableProps: ReturnType<typeof useTablePlotSync<WGBSRow>>["tableProps"];
    ref?: React.RefObject<DownloadPlotHandle | null>;
}

export type WGBSDimensionalityReductionClientProps = {
    rows: WGBSRow[];
}

const WGBSDimensionalityReductionClient = ({ rows }: WGBSDimensionalityReductionClientProps) => {
    const { ref: umapRef, ...umapDownload } = usePlotDownload();
    const { ref: pcaRef, ...pcaDownload } = usePlotDownload();

    const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
        rows,
        getRowId: (row) => row.sample_id,
    });

    const SharedWGBSDimenionalityProps: SharedWGBSDimenionalityProps = useMemo(
        () => ({
            rows,
            selected,
            setSelected,
            sortedFilteredData,
            tableProps,
        }),
        [rows, selected, setSelected, sortedFilteredData, tableProps]
    );

    return (
        <TwoPaneLayout
            direction={{ xs: "column", lg: "row" }}
            rowHeight="max(60vh, 700px)"
            TableComponent={<WGBSDimensionalityTable {...SharedWGBSDimenionalityProps} />}
            plots={[
                {
                    tabTitle: "UMAP",
                    icon: <ScatterPlot />,
                    plotComponent: <WGBSDimensionalityScatterPlot ref={umapRef} {...SharedWGBSDimenionalityProps} />,
                    ...umapDownload,
                },
                {
                    tabTitle: "PCA",
                    icon: <ScatterPlot />,
                    plotComponent: <WGBSDimensionalityPCAPlot ref={pcaRef} {...SharedWGBSDimenionalityProps} />,
                    ...pcaDownload,
                },
            ]}
        />
    )
}

export default WGBSDimensionalityReductionClient;
