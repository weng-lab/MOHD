import { useMemo } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { Typography } from "@mui/material";
import { SharedLipidomicsProps } from "./page";
import { LipidomicsSample } from "@/common/hooks/omeHooks/useLipidomicsData";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";

const truncateMoleculeName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

const LipidomicsQuantificationHeatmap = ({
    lipidomicsData,
    sortedFilteredData,
    selected,
    setSelected,
    autoSort,
    ref,
}: SharedLipidomicsProps) => {
    const { loading } = lipidomicsData;

    const samples: LipidomicsSample[] = sortedFilteredData;

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
            samples.map((sample) => {
                const valueByMolecule = new Map(
                    sample.quantification.map((q) => [q.molecule_name, q.value])
                );

                return {
                    columnName: sample.sample_id,
                    metadata: sample,
                    rows: molecules.map((molecule) => ({
                        rowName: truncateMoleculeName(molecule),
                        count: valueByMolecule.get(molecule) ?? null,
                        metadata: { fullName: molecule },
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
            downloadFileName="lipidomics_quantification_heatmap"
            ref={ref}
            tooltipBody={(bin) => (
                <>
                    <Typography><b>Dataset:</b> {bin.datum.columnName}</Typography>
                    <Typography><b>Molecule:</b> {bin.bin.metadata?.fullName ?? bin.bin.rowName}</Typography>
                    <Typography><b>Value:</b> {bin.bin.count ?? "No data"}</Typography>
                </>
            )}
        />
    );
};

export default LipidomicsQuantificationHeatmap;
