"use client";
import { TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import WGBSDimensionalityTable from "./WGBSDimensionalityTable"
import { ScatterPlot } from "@mui/icons-material"
import WGBSDimensionalityScatterPlot from "./WGBSUMAP"
import WGBSDimensionalityPCAPlot from "./WGBSPCA"
import { useMemo } from "react"
import { DownloadPlotHandle } from "@weng-lab/visualization"
import { useWGBSData, UseWGBSDataReturn } from "@/common/hooks/omeHooks/useWGBSData";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type WGBSMetadata =
    NonNullable<UseWGBSDataReturn["data"]>;

export type SharedWGBSDimenionalityProps = {
    rows: WGBSMetadata;
    WGBSData: UseWGBSDataReturn;
    selected: WGBSMetadata;
    setSelected: React.Dispatch<React.SetStateAction<WGBSMetadata>>;
    sortedFilteredData: WGBSMetadata;
    tableProps: ReturnType<typeof useTablePlotSync<WGBSMetadata[number]>>["tableProps"];
    ref?: React.RefObject<DownloadPlotHandle | null>;
}

const WGBSDimensionalityReduction = () => {
    const { ref: umapRef, ...umapDownload } = usePlotDownload();
    const { ref: pcaRef, ...pcaDownload } = usePlotDownload();
    const WGBSData = useWGBSData({ skip: false });

    const rows: WGBSMetadata = useMemo(() => {
        if (!WGBSData.data) return [];
        return WGBSData.data;
    }, [WGBSData]);

    const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
        rows,
        getRowId: (row) => row.sample_id,
    });

    const SharedWGBSDimenionalityProps: SharedWGBSDimenionalityProps = useMemo(
        () => ({
            rows,
            WGBSData,
            selected,
            setSelected,
            sortedFilteredData,
            tableProps,
        }),
        [WGBSData, rows, selected, setSelected, sortedFilteredData, tableProps]
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

export default WGBSDimensionalityReduction;
