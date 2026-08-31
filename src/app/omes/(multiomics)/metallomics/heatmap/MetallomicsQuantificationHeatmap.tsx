import { useMemo } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { Typography } from "@mui/material";
import { MetallomicsSample, SharedMetallomicsProps } from "./page";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";

const MetallomicsQuantificationHeatmap = ({
    metallomicsData,
    sortedFilteredData,
    selected,
    setSelected,
    autoSort,
    ref,
}: SharedMetallomicsProps) => {
    const { loading } = metallomicsData;

    const samples: MetallomicsSample[] = sortedFilteredData;

    const metals = useMemo(
        () =>
            Array.from(
                new Set(
                    samples.flatMap((sample) =>
                        sample.quantification
                            .filter((q): q is NonNullable<typeof q> => q !== null)
                            .map((q) => q.metal)
                    )
                )
            ).sort(),
        [samples]
    );

    const heatmapData: ColumnDatum<MetallomicsSample>[] = useMemo(
        () =>
            samples.map((sample) => {
                const valueByMetal = new Map(
                    sample.quantification
                        .filter((q): q is NonNullable<typeof q> => q !== null)
                        .map((q) => [q.metal, q.value])
                );

                return {
                    columnName: sample.sample_id,
                    metadata: sample,
                    rows: metals.map((metal) => ({
                        rowName: metal,
                        count: valueByMetal.get(metal) ?? null,
                    })),
                };
            }),
        [samples, metals]
    );

    return (
        <OmeHeatmapShell
            loading={loading}
            samples={samples}
            heatmapData={heatmapData}
            selected={selected}
            setSelected={setSelected}
            autoSort={autoSort}
            yLabel="Metal"
            downloadFileName="metallomics_quantification_heatmap"
            ref={ref}
            tooltipBody={(bin) => (
                <>
                    <Typography><b>Dataset:</b> {bin.datum.columnName}</Typography>
                    <Typography><b>Metal:</b> {bin.bin.rowName}</Typography>
                    <Typography><b>Value:</b> {bin.bin.count ?? "No data"}</Typography>
                </>
            )}
        />
    );
};

export default MetallomicsQuantificationHeatmap;
