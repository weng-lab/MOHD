import { useMemo } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { Typography } from "@mui/material";
import { SharedLipidomicsProps } from "./page";
import { LipidomicsSample } from "@/common/hooks/omeHooks/useLipidomicsData";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import { zScoreByRow } from "@/common/components/OmeQuantification/zScoreByRow";
import { symmetricColorDomain } from "@/common/components/OmeQuantification/symmetricColorDomain";

const truncateMoleculeName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

type MoleculeRowMeta = { fullName: string; rawValue: number };

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

    const heatmapData: ColumnDatum<LipidomicsSample, MoleculeRowMeta>[] = useMemo(() => {
        const valueByMoleculePerSample = samples.map(
            (sample) => new Map(sample.quantification.map((q) => [q.molecule_name, q.value]))
        );

        const zScoreByMolecule = new Map(
            molecules.map((molecule) => [
                molecule,
                zScoreByRow(valueByMoleculePerSample.map((valueByMolecule) => valueByMolecule.get(molecule) ?? null)),
            ])
        );

        return samples.map((sample, sampleIndex) => ({
            columnName: sample.sample_id,
            metadata: sample,
            rows: molecules.map((molecule) => {
                const rawValue = valueByMoleculePerSample[sampleIndex].get(molecule) ?? null;
                return {
                    rowName: truncateMoleculeName(molecule),
                    count: rawValue === null ? null : zScoreByMolecule.get(molecule)!(rawValue),
                    metadata: rawValue === null ? undefined : { fullName: molecule, rawValue },
                };
            }),
        }));
    }, [samples, molecules]);

    const colorDomain = useMemo(() => symmetricColorDomain(heatmapData), [heatmapData]);

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
            colorDomain={colorDomain}
            ref={ref}
            tooltipBody={(bin) => (
                <>
                    <Typography><b>Dataset:</b> {bin.datum.columnName}</Typography>
                    <Typography><b>Molecule:</b> {bin.bin.metadata?.fullName ?? bin.bin.rowName}</Typography>
                    <Typography><b>Value:</b> {bin.bin.metadata?.rawValue ?? "No data"}</Typography>
                </>
            )}
        />
    );
};

export default LipidomicsQuantificationHeatmap;
