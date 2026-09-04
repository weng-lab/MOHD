import { useMemo, useState } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { Box, Stack, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { MetallomicsSample, SharedMetallomicsProps } from "./page";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";

export type MetalGroup = "base" | "ucr";

/**
 * "ucr" selects metals normalized to urine creatinine (name ends in "_UCr").
 * "base" selects everything else, including the standalone "UCr" measurement itself.
 */
const isInGroup = (metal: string, metalGroup: MetalGroup) =>
    metalGroup === "ucr" ? metal.endsWith("_UCr") : !metal.endsWith("_UCr");

type ColorScaleMode = "linear" | "p95" | "p99";

type MetalRowMeta = { rawValue: number };

type MetallomicsQuantificationHeatmapProps = SharedMetallomicsProps & {
    metalGroup: MetalGroup;
    downloadFileName: string;
};

const percentile = (sortedValues: number[], p: number): number => {
    if (sortedValues.length === 0) return 0;
    return sortedValues[Math.floor(p * (sortedValues.length - 1))];
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

    const [colorScaleMode, setColorScaleMode] = useState<ColorScaleMode>("linear");

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

    // Values within this metal group only, used to derive the clamp thresholds below.
    const sortedValues = useMemo(
        () =>
            samples
                .flatMap((sample) =>
                    sample.quantification
                        .filter((q): q is NonNullable<typeof q> => q !== null && isInGroup(q.metal, metalGroup))
                        .map((q) => q.value)
                        .filter((value): value is number => value !== null)
                )
                .sort((a, b) => a - b),
        [samples, metalGroup]
    );

    const p95 = useMemo(() => percentile(sortedValues, 0.95), [sortedValues]);
    const p99 = useMemo(() => percentile(sortedValues, 0.99), [sortedValues]);

    const heatmapData: ColumnDatum<MetallomicsSample, MetalRowMeta>[] = useMemo(() => {
        const clampCeiling = colorScaleMode === "p95" ? p95 : colorScaleMode === "p99" ? p99 : undefined;
        const transformValue = (value: number): number => (clampCeiling ? Math.min(value, clampCeiling) : value);

        return samples.map((sample) => {
            const valueByMetal = new Map(
                sample.quantification
                    .filter((q): q is NonNullable<typeof q> => q !== null && isInGroup(q.metal, metalGroup))
                    .map((q) => [q.metal, q.value])
            );

            return {
                columnName: sample.sample_id,
                metadata: sample,
                rows: metals.map((metal) => {
                    const rawValue = valueByMetal.get(metal) ?? null;
                    return {
                        rowName: metal,
                        count: rawValue === null ? null : transformValue(rawValue),
                        metadata: rawValue === null ? undefined : { rawValue },
                    };
                }),
            };
        });
    }, [samples, metals, metalGroup, colorScaleMode, p95, p99]);

    return (
        <Stack width="100%" height="100%">
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0, pb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    Color scale:
                </Typography>
                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={colorScaleMode}
                    onChange={(_, value: ColorScaleMode | null) => value && setColorScaleMode(value)}
                >
                    <ToggleButton value="linear">Basic</ToggleButton>
                    <ToggleButton value="p95">95th Percentile Clamp</ToggleButton>
                    <ToggleButton value="p99">99th Percentile Clamp</ToggleButton>
                </ToggleButtonGroup>
            </Stack>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <OmeHeatmapShell
                    loading={loading}
                    samples={samples}
                    heatmapData={heatmapData}
                    selected={selected}
                    setSelected={setSelected}
                    autoSort={autoSort}
                    yLabel="Metal"
                    downloadFileName={downloadFileName}
                    ref={ref}
                    tooltipBody={(bin) => (
                        <>
                            <Typography><b>Dataset:</b> {bin.datum.columnName}</Typography>
                            <Typography><b>Metal:</b> {bin.bin.rowName}</Typography>
                            <Typography><b>Value:</b> {(bin.bin.metadata as MetalRowMeta | undefined)?.rawValue ?? "No data"}</Typography>
                        </>
                    )}
                />
            </Box>
        </Stack>
    );
};

export default MetallomicsQuantificationHeatmap;
