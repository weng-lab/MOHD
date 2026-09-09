import { useMemo } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { Typography } from "@mui/material";
import { MetallomicsSample, SharedMetallomicsProps } from "./page";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import { zScoreByRow } from "@/common/components/OmeQuantification/zScoreByRow";
import { symmetricColorDomain } from "@/common/components/OmeQuantification/symmetricColorDomain";

export type MetalGroup = "base" | "ucr";

/**
 * "ucr" selects metals normalized to urine creatinine (name ends in "_UCr").
 * "base" selects everything else, including the standalone "UCr" measurement itself.
 */
const isInGroup = (metal: string, metalGroup: MetalGroup) =>
    metalGroup === "ucr" ? metal.endsWith("_UCr") : !metal.endsWith("_UCr");

type MetalRowMeta = { rawValue: number };

type MetallomicsQuantificationHeatmapProps = SharedMetallomicsProps & {
    metalGroup: MetalGroup;
    downloadFileName: string;
};

const MetallomicsQuantificationHeatmap = ({
    metallomicsData,
    sortedFilteredData,
    selected,
    setSelected,
    autoSort,
    metalGroup,
    downloadFileName,
    ref,
}: MetallomicsQuantificationHeatmapProps) => {
    const { loading } = metallomicsData;

    const samples: MetallomicsSample[] = sortedFilteredData;

    const metals = useMemo(
        () =>
            Array.from(
                new Set(
                    samples.flatMap((sample) =>
                        sample.quantification
                            .filter((q): q is NonNullable<typeof q> => q !== null && isInGroup(q.metal, metalGroup))
                            .map((q) => q.metal)
                    )
                )
            ).sort(),
        [samples, metalGroup]
    );

    const heatmapData: ColumnDatum<MetallomicsSample, MetalRowMeta>[] = useMemo(() => {
        const valueByMetalPerSample = samples.map(
            (sample) =>
                new Map(
                    sample.quantification
                        .filter((q): q is NonNullable<typeof q> => q !== null && isInGroup(q.metal, metalGroup))
                        .map((q) => [q.metal, q.value])
                )
        );

        const zScoreByMetal = new Map(
            metals.map((metal) => [
                metal,
                zScoreByRow(valueByMetalPerSample.map((valueByMetal) => valueByMetal.get(metal) ?? null)),
            ])
        );

        return samples.map((sample, sampleIndex) => ({
            columnName: sample.sample_id,
            metadata: sample,
            rows: metals.map((metal) => {
                const rawValue = valueByMetalPerSample[sampleIndex].get(metal) ?? null;
                return {
                    rowName: metal,
                    count: rawValue === null ? null : zScoreByMetal.get(metal)!(rawValue),
                    metadata: rawValue === null ? undefined : { rawValue },
                };
            }),
        }));
    }, [samples, metals, metalGroup]);

    const colorDomain = useMemo(() => symmetricColorDomain(heatmapData), [heatmapData]);

    return (
        <OmeHeatmapShell
            loading={loading}
            samples={samples}
            heatmapData={heatmapData}
            selected={selected}
            setSelected={setSelected}
            autoSort={autoSort}
            yLabel="Metal"
            downloadFileName={downloadFileName}
            colorDomain={colorDomain}
            ref={ref}
            tooltipBody={(bin) => (
                <>
                    <Typography><b>Dataset:</b> {bin.datum.columnName}</Typography>
                    <Typography><b>Metal:</b> {bin.bin.rowName}</Typography>
                    <Typography><b>Value:</b> {(bin.bin.metadata as MetalRowMeta | undefined)?.rawValue ?? "No data"}</Typography>
                </>
            )}
        />
    );
};

export default MetallomicsQuantificationHeatmap;
