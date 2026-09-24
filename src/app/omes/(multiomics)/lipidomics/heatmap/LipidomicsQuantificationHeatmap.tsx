import { ColumnDatum } from "@weng-lab/visualization";
import { SharedLipidomicsProps } from "./page";
import { LipidomicsSample } from "@/common/hooks/omeHooks/useLipidomicsQuantification";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import PlotTooltip from "@/common/components/PlotTooltip";
import { zScoreByRow } from "@/common/components/OmeQuantification/zScoreByRow";
import { symmetricColorDomain } from "@/common/components/OmeQuantification/symmetricColorDomain";
import { MISSING_LABEL } from "@/common/colors";

const truncateMoleculeName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

type MoleculeRowMeta = { fullName: string; rawValue: number };

const LipidomicsQuantificationHeatmap = ({
  rows,
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
    new Set(rows.flatMap((sample) => sample.quantification.map((q) => q.molecule_name)))
  ).sort();

  // Scored against the full dataset, not the filtered/displayed columns, so filtering
  // the table doesn't shift the color scale - or collapse it to 0 when down to one column.
  const valueByMoleculePerRow = rows.map(
    (sample) => new Map(sample.quantification.map((q) => [q.molecule_name, q.value]))
  );

  const zScoreByMolecule = new Map(
    molecules.map((molecule) => [
      molecule,
      zScoreByRow(valueByMoleculePerRow.map((valueByMolecule) => valueByMolecule.get(molecule) ?? null)),
    ])
  );

  const heatmapData: ColumnDatum<LipidomicsSample, MoleculeRowMeta>[] = samples.map((sample) => {
    const valueByMolecule = new Map(sample.quantification.map((q) => [q.molecule_name, q.value]));
    return {
      columnName: sample.sample_id,
      metadata: sample,
      rows: molecules.map((molecule) => {
        const rawValue = valueByMolecule.get(molecule) ?? null;
        return {
          rowName: truncateMoleculeName(molecule),
          count: rawValue === null ? null : zScoreByMolecule.get(molecule)!(rawValue),
          metadata: rawValue === null ? undefined : { fullName: molecule, rawValue },
        };
      }),
    };
  });

  // Domain also comes from the full dataset, not just the displayed columns, so the
  // legend's scale doesn't shift as the table is filtered.
  const colorDomain = symmetricColorDomain(
    rows.map((sample, i) => ({
      columnName: sample.sample_id,
      rows: molecules.map((molecule) => {
        const rawValue = valueByMoleculePerRow[i].get(molecule) ?? null;
        return { rowName: molecule, count: rawValue === null ? null : zScoreByMolecule.get(molecule)!(rawValue) };
      }),
    }))
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
      colorDomain={colorDomain}
      ref={ref}
      tooltipBody={(bin) => {
        const rowMeta = bin.bin.metadata as MoleculeRowMeta | undefined;
        const sample = bin.datum.metadata as LipidomicsSample | undefined;
        return (
          <PlotTooltip
            title={bin.datum.columnName}
            rows={[
              { label: "Age", value: sample?.age_bin ?? MISSING_LABEL },
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
