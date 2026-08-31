import { useMemo } from "react";
import { Heatmap, ColumnDatum, HeatmapCellId } from "@weng-lab/visualization";
import { Stack, Box, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SharedExposomicsProps } from "./page";
import { ExposomicsSample } from "@/common/hooks/omeHooks/useExposomicsData";

const ExposomicsQuantificationHeatmap = ({
    exposomicsData,
    sortedFilteredData,
    selected,
    setSelected,
    autoSort,
    ref,
}: SharedExposomicsProps) => {
    const theme = useTheme();
    const heatmapColors: [string, string, string, string] = [theme.palette.primary.main, theme.palette.primary.light, theme.palette.secondary.light, theme.palette.secondary.main];
    const { loading } = exposomicsData;

    const samples: ExposomicsSample[] = sortedFilteredData;

    const truncateMoleculeName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

    const molecules = useMemo(
        () =>
            Array.from(
                new Map(
                    samples.flatMap((sample) => sample.quantification.map((q) => [q.position, q] as const))
                ).values()
            ).sort((a, b) => a.position - b.position),
        [samples]
    );

    const heatmapData: ColumnDatum<ExposomicsSample>[] = useMemo(
        () =>
            samples.map((sample) => {
                const valueByPosition = new Map(
                    sample.quantification.map((q) => [q.position, q.value])
                );

                return {
                    columnName: sample.sample_id,
                    metadata: sample,
                    rows: molecules.map((molecule) => ({
                        rowName: truncateMoleculeName(molecule.molecule_name || "Unknown"),
                        count: valueByPosition.get(molecule.position) ?? null,
                        metadata: {
                            fullName: molecule.molecule_name || "Unknown",
                            formula: molecule.formula,
                            ionType: molecule.precursor_ion_type,
                            precursorMz: molecule.precursor_mz,
                        },
                    })),
                };
            }),
        [samples, molecules]
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
                        yLabel="Molecule"
                        showLegend
                        downloadFileName="exposomics_quantification_heatmap"
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
                                <Typography><b>Molecule:</b> {bin.bin.metadata?.fullName ?? bin.bin.rowName}</Typography>
                                {bin.bin.metadata?.formula && <Typography><b>Formula:</b> {bin.bin.metadata.formula}</Typography>}
                                {bin.bin.metadata?.ionType && <Typography><b>Ion Type:</b> {bin.bin.metadata.ionType}</Typography>}
                                {bin.bin.metadata?.precursorMz != null && <Typography><b>Precursor m/z:</b> {bin.bin.metadata.precursorMz}</Typography>}
                                <Typography><b>Value:</b> {bin.bin.count ?? "No data"}</Typography>
                            </>
                        )}
                    />
                )}
            </Box>
        </Stack>
    );
};

export default ExposomicsQuantificationHeatmap;
