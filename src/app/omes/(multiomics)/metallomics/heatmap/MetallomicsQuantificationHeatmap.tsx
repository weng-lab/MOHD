import { useMemo, useState } from "react";
import { Heatmap, ColumnDatum } from "@weng-lab/visualization";
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
import { MetallomicsSample, SharedMetallomicsProps } from "./page";

// Sequential ramp built from the metallomics ome color (#da7bbe), light -> dark.
const heatmapColors: [string, string, string] = ["#fbeef7", "#da7bbe", "#6b2158"];

const formatValue = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const MetallomicsQuantificationHeatmap = ({
    metallomicsData,
    ref,
}: SharedMetallomicsProps) => {
    const { data, loading } = metallomicsData;
    const [siteFilter, setSiteFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [sexFilter, setSexFilter] = useState<string>("");

    const samples: MetallomicsSample[] = useMemo(
        () => (data ?? []).filter((row): row is MetallomicsSample => row !== null),
        [data]
    );

    const siteOptions = useMemo(() => Array.from(new Set(samples.map((s) => s.site))).sort(), [samples]);
    const statusOptions = useMemo(() => Array.from(new Set(samples.map((s) => s.status))).sort(), [samples]);
    const sexOptions = useMemo(() => Array.from(new Set(samples.map((s) => s.sex))).sort(), [samples]);

    const effectiveSite = siteFilter || siteOptions[0] || "";
    const effectiveStatus = statusFilter || statusOptions[0] || "";
    const effectiveSex = sexFilter || sexOptions[0] || "";

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
            filteredSamples.map((sample) => {
                const valueByMetal = new Map(
                    sample.quantification
                        .filter((q): q is NonNullable<typeof q> => q !== null)
                        .map((q) => [q.metal, q.value ?? 0])
                );

                return {
                    columnName: sample.sample_id,
                    metadata: sample,
                    rows: metals.map((metal) => ({
                        rowName: metal,
                        count: valueByMetal.get(metal) ?? 0,
                    })),
                };
            }),
        [filteredSamples, metals]
    );

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
                        yLabel="Metal"
                        showLegend
                        downloadFileName="metallomics_quantification_heatmap"
                        tooltipBody={(bin) => (
                            <>
                                <Typography><b>Dataset:</b> {bin.datum.columnName}</Typography>
                                <Typography><b>Metal:</b> {bin.bin.rowName}</Typography>
                                <Typography><b>Value:</b> {bin.bin.count}</Typography>
                            </>
                        )}
                    />
                )}
            </Box>
        </Stack>
    );
};

export default MetallomicsQuantificationHeatmap;
