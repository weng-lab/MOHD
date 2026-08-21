import { useEffect, useMemo, useState } from "react";
import { Heatmap, ColumnDatum, HeatmapCellId } from "@weng-lab/visualization";
import {
    Stack,
    Box,
    CircularProgress,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SharedLipidomicsProps } from "./page";
import { LipidomicsSample } from "@/common/hooks/omeHooks/useLipidomicsData";

const formatValue = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const LipidomicsQuantificationHeatmap = ({
    lipidomicsData,
    tableProps,
    selected,
    setSelected,
    ref,
}: SharedLipidomicsProps) => {
    const theme = useTheme();
    const heatmapColors: [string, string, string, string] = [theme.palette.primary.main, theme.palette.primary.light, theme.palette.secondary.light, theme.palette.secondary.main];
    const { data, loading } = lipidomicsData;
    const [siteFilter, setSiteFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [sexFilter, setSexFilter] = useState<string>("");

    const samples: LipidomicsSample[] = useMemo(() => data ?? [], [data]);

    const siteOptions = useMemo(() => Array.from(new Set(samples.map((s) => s.site))).sort(), [samples]);
    const statusOptions = useMemo(() => Array.from(new Set(samples.map((s) => s.status))).sort(), [samples]);
    const sexOptions = useMemo(() => Array.from(new Set(samples.map((s) => s.sex))).sort(), [samples]);

    const effectiveSite = siteFilter || siteOptions[0] || "";
    const effectiveStatus = statusFilter || statusOptions[0] || "";
    const effectiveSex = sexFilter || sexOptions[0] || "";

    useEffect(() => {
        const api = tableProps.apiRef.current;
        if (!api || !effectiveSite || !effectiveStatus || !effectiveSex) return;

        const otherItems = api.state.filter.filterModel.items.filter(
            (item) => item.field !== "site" && item.field !== "status" && item.field !== "sex"
        );

        api.setFilterModel({
            items: [
                ...otherItems,
                { field: "site", operator: "is", value: effectiveSite },
                { field: "status", operator: "is", value: effectiveStatus },
                { field: "sex", operator: "is", value: effectiveSex },
            ],
        });
    }, [tableProps.apiRef, effectiveSite, effectiveStatus, effectiveSex]);

    const filteredSamples = useMemo(
        () =>
            samples.filter(
                (sample) =>
                    sample.site === effectiveSite &&
                    sample.status === effectiveStatus &&
                    sample.sex === effectiveSex
            ),
        [samples, effectiveSite, effectiveStatus, effectiveSex]
    );

    const molecules = useMemo(
        () =>
            Array.from(
                new Set(
                    samples.flatMap((sample) => sample.quantification.map((q) => q.molecule_name))
                )
            ).sort(),
        [samples]
    );

    const heatmapData: ColumnDatum<LipidomicsSample>[] = useMemo(
        () =>
            filteredSamples.map((sample) => {
                const valueByMolecule = new Map(
                    sample.quantification.map((q) => [q.molecule_name, q.value])
                );

                return {
                    columnName: sample.sample_id,
                    metadata: sample,
                    rows: molecules.map((molecule) => ({
                        rowName: molecule,
                        count: valueByMolecule.get(molecule) ?? null,
                    })),
                };
            }),
        [filteredSamples, molecules]
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
        const sample = filteredSamples.find((s) => s.sample_id === sampleId);
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
            <Stack direction="row" flexWrap="wrap" gap={1}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Site</InputLabel>
                    <Select
                        value={effectiveSite}
                        label="Site"
                        onChange={(event: SelectChangeEvent) => setSiteFilter(event.target.value)}
                        MenuProps={{ disableScrollLock: true }}
                        size="small"
                    >
                        {siteOptions.map((site) => (
                            <MenuItem key={site} value={site}>{site}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={effectiveStatus}
                        label="Status"
                        onChange={(event: SelectChangeEvent) => setStatusFilter(event.target.value)}
                        MenuProps={{ disableScrollLock: true }}
                        size="small"
                    >
                        {statusOptions.map((status) => (
                            <MenuItem key={status} value={status}>{formatValue(status)}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Sex</InputLabel>
                    <Select
                        value={effectiveSex}
                        label="Sex"
                        onChange={(event: SelectChangeEvent) => setSexFilter(event.target.value)}
                        MenuProps={{ disableScrollLock: true }}
                        size="small"
                    >
                        {sexOptions.map((sex) => (
                            <MenuItem key={sex} value={sex}>{formatValue(sex)}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                {heatmapData.length === 0 ? (
                    <Stack width="100%" height="100%" alignItems="center" justifyContent="center">
                        <Typography color="text.secondary">No samples match the selected filters.</Typography>
                    </Stack>
                ) : (
                    <Heatmap
                        ref={ref}
                        data={heatmapData}
                        colors={heatmapColors}
                        xLabel="Sample"
                        yLabel="Molecule"
                        showLegend
                        downloadFileName="lipidomics_quantification_heatmap"
                        selectedCells={selectedCells}
                        onClick={(bin) => handleCellClick(bin.datum.columnName)}
                        xLabelOrientation="leftDiagonal"
                        tooltipBody={(bin) => (
                            <>
                                <Typography><b>Dataset:</b> {bin.datum.columnName}</Typography>
                                <Typography><b>Molecule:</b> {bin.bin.rowName}</Typography>
                                <Typography><b>Value:</b> {bin.bin.count ?? "No data"}</Typography>
                            </>
                        )}
                    />
                )}
            </Box>
        </Stack>
    );
};

export default LipidomicsQuantificationHeatmap;
