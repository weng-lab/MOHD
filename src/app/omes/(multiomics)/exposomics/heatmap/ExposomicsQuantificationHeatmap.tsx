import { useMemo } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { Typography } from "@mui/material";
import { SharedExposomicsProps } from "./page";
import { ExposomicsSample } from "@/common/hooks/omeHooks/useExposomicsData";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";

const truncateMoleculeName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

const ExposomicsQuantificationHeatmap = ({
    exposomicsData,
    sortedFilteredData,
    selected,
    setSelected,
    autoSort,
    ref,
}: SharedExposomicsProps) => {
    const { loading } = exposomicsData;

    const samples: ExposomicsSample[] = sortedFilteredData;

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

    return (
        <OmeHeatmapShell
            loading={loading}
            samples={samples}
            heatmapData={heatmapData}
            selected={selected}
            setSelected={setSelected}
            autoSort={autoSort}
            yLabel="Molecule"
            downloadFileName="exposomics_quantification_heatmap"
            ref={ref}
            tooltipBody={(bin) => (
                <>
                    <Typography><b>Dataset:</b> {bin.datum.columnName}</Typography>
                    <Typography><b>Molecule:</b> {bin.bin.metadata?.fullName ?? bin.bin.rowName}</Typography>
                    {bin.bin.metadata?.formula ? <Typography><b>Formula:</b> {bin.bin.metadata.formula}</Typography> : null}
                    {bin.bin.metadata?.ionType ? <Typography><b>Ion Type:</b> {bin.bin.metadata.ionType}</Typography> : null}
                    {bin.bin.metadata?.precursorMz != null ? <Typography><b>Precursor m/z:</b> {bin.bin.metadata.precursorMz}</Typography> : null}
                    <Typography><b>Value:</b> {bin.bin.count ?? "No data"}</Typography>
                </>
            )}
        />
    );
};

export default ExposomicsQuantificationHeatmap;
