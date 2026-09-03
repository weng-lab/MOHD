"use client";
import { TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import MetallomicsQuantificationTable from "./MetallomicsQuantificationTable"
import { GridOn } from "@mui/icons-material"
import MetallomicsQuantificationHeatmap from "./MetallomicsQuantificationHeatmap"
import { useMemo, useState } from "react"
import { DownloadPlotHandle } from "@weng-lab/visualization";
import { useMetallomicsData, UseMetallomicsDataReturn } from "@/common/hooks/omeHooks/useMetallomicsData";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type MetallomicsSample = NonNullable<NonNullable<UseMetallomicsDataReturn["data"]>[number]>;
export type MetallomicsMetadata = MetallomicsSample[];

export type SharedMetallomicsProps = {
    rows: MetallomicsMetadata;
    metallomicsData: UseMetallomicsDataReturn;
    selected: MetallomicsMetadata;
    setSelected: React.Dispatch<React.SetStateAction<MetallomicsMetadata>>;
    sortedFilteredData: MetallomicsMetadata;
    tableProps: ReturnType<typeof useTablePlotSync<MetallomicsSample>>["tableProps"];
    autoSort: boolean;
    setAutoSort: React.Dispatch<React.SetStateAction<boolean>>;
    ref?: React.RefObject<DownloadPlotHandle | null>;
}

const MetallomicsHeatmap = () => {
    const { ref: heatmapRef, ...heatmapDownload } = usePlotDownload();
    const metallomicsData = useMetallomicsData({ skip: false });

    const rows: MetallomicsMetadata = useMemo(() => {
        if (!metallomicsData.data) return [];
        return metallomicsData.data.filter((row): row is MetallomicsSample => row !== null);
    }, [metallomicsData]);

    const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
        rows,
        getRowId: (row) => row.sample_id,
    });
    const [autoSort, setAutoSort] = useState(false);

    const SharedMetallomicsProps: SharedMetallomicsProps = useMemo(
        () => ({
            rows,
            metallomicsData,
            selected,
            setSelected,
            sortedFilteredData,
            tableProps,
            autoSort,
            setAutoSort,
        }),
        [metallomicsData, rows, selected, setSelected, sortedFilteredData, tableProps, autoSort]
    );

    return (
        <TwoPaneLayout
            direction={{ xs: "column", lg: "row" }}
            rowHeight="max(60vh, 700px)"
            TableComponent={<MetallomicsQuantificationTable {...SharedMetallomicsProps} />}
            plots={[
                {
                    tabTitle: "Heatmap",
                    icon: <GridOn />,
                    plotComponent: <MetallomicsQuantificationHeatmap ref={heatmapRef} {...SharedMetallomicsProps} />,
                    ...heatmapDownload,
                    dataDownloadLinks: [
                        {
                            title: "Metallomics Quantification (TSV)",
                            link: "https://downloads.mohdconsortium.org/Metals/snapshot1_metallomics_quant.tsv",
                        },
                    ],
                },
            ]}
        />
    )
}

export default MetallomicsHeatmap;
