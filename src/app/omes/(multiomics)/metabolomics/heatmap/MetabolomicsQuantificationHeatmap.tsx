import { useMemo } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { Typography } from "@mui/material";
import { SharedMetabolomicsProps } from "./page";
import { MetabolomicsSample } from "@/common/hooks/omeHooks/useMetabolomicsData";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";

const compoundKey = (compound: string, mode: string) => `${compound}::${mode}`;
const truncateCompoundName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

const MetabolomicsQuantificationHeatmap = ({
    metabolomicsData,
    sortedFilteredData,
    selected,
    setSelected,
    autoSort,
    ref,
}: SharedMetabolomicsProps) => {
    const { loading } = metabolomicsData;

    const samples: MetabolomicsSample[] = sortedFilteredData;

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

    return (
        <OmeHeatmapShell
            loading={loading}
            samples={samples}
            heatmapData={heatmapData}
            selected={selected}
            setSelected={setSelected}
            autoSort={autoSort}
            yLabel="Compound"
            downloadFileName="metabolomics_quantification_heatmap"
            ref={ref}
            tooltipBody={(bin) => (
                <>
                    <Typography><b>Dataset:</b> {bin.datum.columnName}</Typography>
                    <Typography><b>Compound:</b> {bin.bin.metadata?.fullName ?? bin.bin.rowName}</Typography>
                    <Typography><b>Mode:</b> {bin.bin.metadata?.mode}</Typography>
                    <Typography><b>Value:</b> {bin.bin.count ?? "No data"}</Typography>
                </>
            )}
        />
    );
};

export default MetabolomicsQuantificationHeatmap;
