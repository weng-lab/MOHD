import { useMemo } from "react";
import { Heatmap, ColumnDatum, HeatmapCellId } from "@weng-lab/visualization";
import { Stack, Box, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SharedMetabolomicsProps } from "./page";
import { MetabolomicsSample } from "@/common/hooks/omeHooks/useMetabolomicsData";

const compoundKey = (compound: string, mode: string) => `${compound}::${mode}`;

const MetabolomicsQuantificationHeatmap = ({
    metabolomicsData,
    sortedFilteredData,
    selected,
    setSelected,
    autoSort,
    ref,
}: SharedMetabolomicsProps) => {
    const theme = useTheme();
    const heatmapColors: [string, string, string, string] = [theme.palette.primary.main, theme.palette.primary.light, theme.palette.secondary.light, theme.palette.secondary.main];
    const { loading } = metabolomicsData;

    const samples: MetabolomicsSample[] = sortedFilteredData;

    const truncateCompoundName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

    const compounds = useMemo(
        () =>
            Array.from(
                new Map(
                    samples.flatMap((sample) =>
                        sample.quantification.map((q) => [compoundKey(q.compound, q.mode), q] as const)
                    )
                ).values()
            ).sort((a, b) => a.compound.localeCompare(b.compound) || a.mode.localeCompare(b.mode)),
        [samples]
    );

    const heatmapData: ColumnDatum<MetabolomicsSample>[] = useMemo(
        () =>
            samples.map((sample) => {
                const valueByCompound = new Map(
                    sample.quantification.map((q) => [compoundKey(q.compound, q.mode), q.value])
                );

                return {
                    columnName: sample.sample_id,
                    metadata: sample,
                    rows: compounds.map((compound) => ({
                        rowName: truncateCompoundName(compound.compound),
                        count: valueByCompound.get(compoundKey(compound.compound, compound.mode)) ?? null,
                        metadata: { fullName: compound.compound, mode: compound.mode },
                    })),
                };
            }),
        [samples, compounds]
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
                        yLabel="Compound"
                        showLegend
                        downloadFileName="metabolomics_quantification_heatmap"
                        selectedCells={selectedCells}
                        onClick={(bin) => handleCellClick(bin.datum.columnName)}
                        cellWidth={25}
                        cellHeight={20}
                        xLabelOrientation="leftDiagonal"
                        showMiniMap
                        scrollToSelection={!autoSort}
                        tooltipBody={(bin) => (
                            <>
                                <Typography><b>Dataset:</b> {bin.datum.columnName}</Typography>
                                <Typography><b>Compound:</b> {bin.bin.metadata?.fullName ?? bin.bin.rowName}</Typography>
                                <Typography><b>Mode:</b> {bin.bin.metadata?.mode}</Typography>
                                <Typography><b>Value:</b> {bin.bin.count ?? "No data"}</Typography>
                            </>
                        )}
                    />
                )}
            </Box>
        </Stack>
    );
};

export default MetabolomicsQuantificationHeatmap;
