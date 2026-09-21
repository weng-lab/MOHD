import { ColumnDatum } from "@weng-lab/visualization";
import { SharedLipidomicsProps } from "./page";
import { LipidomicsSample } from "@/common/hooks/omeHooks/useLipidomicsQuantification";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import PlotTooltip from "@/common/components/PlotTooltip";
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

  const molecules = Array.from(
    new Set(samples.flatMap((sample) => sample.quantification.map((q) => q.molecule_name)))
  ).sort();

  const valueByMoleculePerSample = samples.map(
    (sample) => new Map(sample.quantification.map((q) => [q.molecule_name, q.value]))
  );

  const zScoreByMolecule = new Map(
    molecules.map((molecule) => [
      molecule,
      zScoreByRow(valueByMoleculePerSample.map((valueByMolecule) => valueByMolecule.get(molecule) ?? null)),
    ])
  );

  const heatmapData: ColumnDatum<LipidomicsSample, MoleculeRowMeta>[] = samples.map((sample, sampleIndex) => ({
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

  const colorDomain = symmetricColorDomain(heatmapData);

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
      tooltipBody={(bin) => {
        const rowMeta = bin.bin.metadata as MoleculeRowMeta | undefined;
        return (
          <PlotTooltip
            title={bin.datum.columnName}
            rows={[
              { label: "Molecule", value: rowMeta?.fullName ?? bin.bin.rowName },
              { label: "Value", value: rowMeta?.rawValue ?? "No data" },
            ]}
          />
        );
      }}
    />
  );
};

export default LipidomicsQuantificationHeatmap;
