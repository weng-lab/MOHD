"use client";
import { TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import MetabolomicsQuantificationTable from "./MetabolomicsQuantificationTable"
import { GridOn } from "@mui/icons-material"
import MetabolomicsQuantificationHeatmap from "./MetabolomicsQuantificationHeatmap"
import { useMemo, useState } from "react"
import { DownloadPlotHandle } from "@weng-lab/visualization";
import { useMetabolomicsData, UseMetabolomicsDataReturn, MetabolomicsSample } from "@/common/hooks/omeHooks/useMetabolomicsData";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type MetabolomicsMetadata = MetabolomicsSample[];

export type SharedMetabolomicsProps = {
    rows: MetabolomicsMetadata;
    metabolomicsData: UseMetabolomicsDataReturn;
    selected: MetabolomicsMetadata;
    setSelected: React.Dispatch<React.SetStateAction<MetabolomicsMetadata>>;
    sortedFilteredData: MetabolomicsMetadata;
    tableProps: ReturnType<typeof useTablePlotSync<MetabolomicsSample>>["tableProps"];
    autoSort: boolean;
    setAutoSort: React.Dispatch<React.SetStateAction<boolean>>;
    ref?: React.RefObject<DownloadPlotHandle | null>;
}

const MetabolomicsHeatmap = () => {
    const { ref: heatmapRef, ...heatmapDownload } = usePlotDownload();
    const metabolomicsData = useMetabolomicsData({ skip: false });

    const rows: MetabolomicsMetadata = useMemo(() => {
        if (!metabolomicsData.data) return [];
        return metabolomicsData.data;
    }, [metabolomicsData]);

    const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
        rows,
        getRowId: (row) => row.sample_id,
    });
    const [autoSort, setAutoSort] = useState(false);

    const SharedMetabolomicsProps: SharedMetabolomicsProps = useMemo(
        () => ({
            rows,
            metabolomicsData,
            selected,
            setSelected,
            sortedFilteredData,
            tableProps,
            autoSort,
            setAutoSort,
        }),
        [metabolomicsData, rows, selected, setSelected, sortedFilteredData, tableProps, autoSort]
    );

    return (
        <TwoPaneLayout
            direction={{ xs: "column", lg: "row" }}
            rowHeight="max(60vh, 700px)"
            TableComponent={<MetabolomicsQuantificationTable {...SharedMetabolomicsProps} />}
            plots={[
                {
                    tabTitle: "Heatmap",
                    icon: <GridOn />,
                    plotComponent: <MetabolomicsQuantificationHeatmap ref={heatmapRef} {...SharedMetabolomicsProps} />,
                    ...heatmapDownload,
                    dataDownloadLinks: [
                        {
                            title: "Metabolomics Quantification (TSV)",
                            link: "https://downloads.mohdconsortium.org/5_Metabolomics/snapshot1_metabolomics_quant.tsv",
                        },
                    ],
                },
            ]}
        />
    )
}

export default MetabolomicsHeatmap;
