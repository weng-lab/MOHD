import { ColumnDatum } from "@weng-lab/visualization";
import { SharedExposomicsProps } from "./page";
import { ExposomicsSample } from "@/common/hooks/omeHooks/useExposomicsData";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import PlotTooltip, { PlotTooltipRow } from "@/common/components/PlotTooltip";

const truncateMoleculeName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

type MoleculeRowMeta = { fullName: string; formula: string; ionType: string; precursorMz: number | null };

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

  const molecules = Array.from(
    new Map(samples.flatMap((sample) => sample.quantification.map((q) => [q.position, q] as const))).values()
  ).sort((a, b) => a.position - b.position);

  const heatmapData: ColumnDatum<ExposomicsSample, MoleculeRowMeta>[] = samples.map((sample) => {
    const valueByPosition = new Map(sample.quantification.map((q) => [q.position, q.value]));

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
  });

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
      tooltipBody={(bin) => {
        const rowMeta = bin.bin.metadata as MoleculeRowMeta | undefined;
        const rows: PlotTooltipRow[] = [{ label: "Molecule", value: rowMeta?.fullName ?? bin.bin.rowName }];
        if (rowMeta?.formula) rows.push({ label: "Formula", value: rowMeta.formula });
        if (rowMeta?.ionType) rows.push({ label: "Ion Type", value: rowMeta.ionType });
        if (rowMeta?.precursorMz != null) rows.push({ label: "Precursor m/z", value: rowMeta.precursorMz });
        rows.push({ label: "Value", value: bin.bin.count ?? "No data" });

        return <PlotTooltip title={bin.datum.columnName} rows={rows} />;
      }}
    />
  );
};

export default ExposomicsQuantificationHeatmap;
