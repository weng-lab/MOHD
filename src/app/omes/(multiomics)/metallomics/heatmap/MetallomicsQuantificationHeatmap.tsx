import { useMemo } from "react";
import { Heatmap, ColumnDatum, HeatmapCellId } from "@weng-lab/visualization";
import { Stack, Box, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MetallomicsSample, SharedMetallomicsProps } from "./page";

const MetallomicsQuantificationHeatmap = ({
    metallomicsData,
    sortedFilteredData,
    selected,
    setSelected,
    ref,
}: SharedMetallomicsProps) => {
    const theme = useTheme();
    const heatmapColors: [string, string, string, string] = [theme.palette.primary.main, theme.palette.primary.light, theme.palette.secondary.light, theme.palette.secondary.main];
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

    const selectedCells: HeatmapCellId[] = useMemo(() => {
        const selectedIds = new Set(selected.map((sample) => sample.sample_id));
        return heatmapData.flatMap((column, columnIndex) =>
            selectedIds.has(column.columnName)
                ? column.rows.map((_, rowIndex) => ({ row: rowIndex, column: columnIndex }))
                : []
        );
    }, [heatmapData, selected]);

    const handleCellClick = (sampleId: string) => {
        const sample = samples.find((s) => s.sample_id === sampleId);
        if (!sample) return;

        setSelected((prev) =>
            prev.some((s) => s.sample_id === sampleId)
                ? prev.filter((s) => s.sample_id !== sampleId)
                : [...prev, sample]
        );
    };

    if (loading) {
        return (
            <Stack width="100%" height="100%" alignItems="center" justifyContent="center">
                <CircularProgress />
            </Stack>
        );
    }

    return (
        <Stack width="100%" height="100%">
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                {heatmapData.length === 0 ? (
                    <Stack width="100%" height="100%" alignItems="center" justifyContent="center">
                        <Typography color="text.secondary">No samples match the current table filters.</Typography>
                    </Stack>
                ) : (
                    <Heatmap
                        ref={ref}
                        data={heatmapData}
                        colors={heatmapColors}
                        xLabel="Sample"
                        yLabel="Metal"
                        showLegend
                        downloadFileName="metallomics_quantification_heatmap"
                        selectedCells={selectedCells}
                        onClick={(bin) => handleCellClick(bin.datum.columnName)}
                        cellWidth={25}
                        cellHeight={20}
                        xLabelOrientation="leftDiagonal"
                        tooltipBody={(bin) => (
                            <>
                                <Typography><b>Dataset:</b> {bin.datum.columnName}</Typography>
                                <Typography><b>Metal:</b> {bin.bin.rowName}</Typography>
                                <Typography><b>Value:</b> {bin.bin.count ?? "No data"}</Typography>
                            </>
                        )}
                    />
                )}
            </Box>
        </Stack>
    );
};

export default MetallomicsQuantificationHeatmap;
