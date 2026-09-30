import { useState } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { SharedExposomicsProps } from "./page";
import { ExposomicsSample } from "@/common/hooks/omeHooks/useExposomicsData";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import HeatmapScaleToggle from "@/common/components/OmeQuantification/HeatmapScaleToggle";
import {
  buildHeatmapColorScale,
  EXPOSOMICS_MODES,
  HeatmapScaleMode,
  valuesByRow,
} from "@/common/components/OmeQuantification/heatmapColorScale";
import PlotTooltip, { PlotTooltipRow } from "@/common/components/PlotTooltip";

const truncateMoleculeName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

type MoleculeRowMeta = {
  /** The row's key for the color scale: molecules are told apart by position, not by name. */
  key: string;
  fullName: string;
  formula: string;
  ionType: string;
  precursorMz: number | null;
  rawValue: number | null;
};

const valueByPosition = (sample: ExposomicsSample) =>
  new Map(sample.quantification.map((q) => [String(q.position), q.value]));

const ExposomicsQuantificationHeatmap = ({ exposomicsData, sampleTable, ref }: SharedExposomicsProps) => {
  const { loading } = exposomicsData;
  // Every plotted sample, which each row's scale is fitted to, and the table's, in its order, as the columns.
  const { plotted: rows, inTableOrder: samples, selected, setSelected, autoSort } = sampleTable;
  const [scaleMode, setScaleMode] = useState<HeatmapScaleMode>("zscore");

  const molecules = Array.from(
    new Map(samples.flatMap((sample) => sample.quantification.map((q) => [q.position, q] as const))).values()
  ).sort((a, b) => a.position - b.position);
  const moleculeKeys = molecules.map((molecule) => String(molecule.position));

  const valueByPositionPerSample = samples.map(valueByPosition);

  const scale = buildHeatmapColorScale(scaleMode, valuesByRow(moleculeKeys, rows.map(valueByPosition)), "molecule");

  const heatmapData: ColumnDatum<ExposomicsSample, MoleculeRowMeta>[] = samples.map((sample, sampleIndex) => ({
    columnName: sample.sample_id,
    metadata: sample,
    rows: molecules.map((molecule, moleculeIndex) => {
      const key = moleculeKeys[moleculeIndex];
      const rawValue = valueByPositionPerSample[sampleIndex].get(key) ?? null;
      return {
        rowName: truncateMoleculeName(molecule.molecule_name || "Unknown"),
        // Unclamped where a colorbar can move the range: the heatmap holds colors at its ends itself.
        count: rawValue === null ? null : (scale.colorbar?.value ?? scale.toCount)(key, rawValue),
        metadata: {
          key,
          fullName: molecule.molecule_name || "Unknown",
          formula: molecule.formula,
          ionType: molecule.precursor_ion_type,
          precursorMz: molecule.precursor_mz,
          rawValue,
        },
      };
    }),
  }));

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
      colors={scale.colors}
      colorDomain={scale.colorDomain}
      colorbar={scale.colorbar}
      total={rows.length}
      controls={<HeatmapScaleToggle modes={EXPOSOMICS_MODES} value={scaleMode} onChange={setScaleMode} />}
      ref={ref}
      tooltipBody={(bin, domain) => {
        const rowMeta = bin.bin.metadata as MoleculeRowMeta | undefined;
        const rows: PlotTooltipRow[] = [{ label: "Molecule", value: rowMeta?.fullName ?? bin.bin.rowName }];
        if (rowMeta?.formula) rows.push({ label: "Formula", value: rowMeta.formula });
        if (rowMeta?.ionType) rows.push({ label: "Ion Type", value: rowMeta.ionType });
        if (rowMeta?.precursorMz != null) rows.push({ label: "Precursor m/z", value: rowMeta.precursorMz });
        rows.push({ label: "Value", value: rowMeta?.rawValue ?? "No data" });
        if (rowMeta?.rawValue != null)
          rows.push({ label: "Color", value: scale.describe(rowMeta.key, rowMeta.rawValue, domain) });

        return <PlotTooltip title={bin.datum.columnName} rows={rows} />;
      }}
    />
  );
};

export default ExposomicsQuantificationHeatmap;
