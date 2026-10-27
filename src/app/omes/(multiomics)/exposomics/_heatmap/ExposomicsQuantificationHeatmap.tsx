import { useState } from "react";
import { SharedExposomicsProps } from "./page";
import { ExposomicsSample } from "@/common/hooks/omeHooks/useExposomicsData";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import HeatmapScaleToggle from "@/common/components/OmeQuantification/HeatmapScaleToggle";
import {
  buildHeatmapColorScale,
  EXPOSOMICS_MODES,
  heatmapValues,
  HeatmapScaleMode,
  valuesByRow,
} from "@/common/components/OmeQuantification/heatmapColorScale";
import PlotTooltip, { PlotTooltipRow } from "@/common/components/PlotTooltip";
import { tooltipRowsOf } from "@/common/sampleFields/fields";

/** Molecules are told apart by position, not by name, which can repeat or be missing. */
const valueByPosition = (sample: ExposomicsSample) =>
  new Map(sample.quantification.map((q) => [String(q.position), q.value]));

const ExposomicsQuantificationHeatmap = ({ exposomicsData, sampleTable, ref }: SharedExposomicsProps) => {
  const { loading } = exposomicsData;
  // Every plotted sample, which each row's scale is fitted to, and the table's, in its order, as the columns.
  const { plotted: rows, inTableOrder: samples, fields, selected, setSelected, autoSort } = sampleTable;
  const [scaleMode, setScaleMode] = useState<HeatmapScaleMode>("zscore");

  const molecules = Array.from(
    new Map(samples.flatMap((sample) => sample.quantification.map((q) => [q.position, q] as const))).values()
  ).sort((a, b) => a.position - b.position);
  const moleculeKeys = molecules.map((molecule) => String(molecule.position));
  const moleculeName = (molecule: (typeof molecules)[number]) => molecule.molecule_name || "Unknown";

  const valueByPositionPerSample = samples.map(valueByPosition);

  const scale = buildHeatmapColorScale(scaleMode, valuesByRow(moleculeKeys, rows.map(valueByPosition)), "molecule");
  const values = heatmapValues(scale, moleculeKeys, valueByPositionPerSample);

  return (
    <OmeHeatmapShell
      loading={loading}
      samples={samples}
      rowNames={molecules.map(moleculeName)}
      values={values}
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
      tooltipBody={(cell, domain) => {
        const sample = samples[cell.column];
        const molecule = molecules[cell.row];
        const key = moleculeKeys[cell.row];
        const rawValue = valueByPositionPerSample[cell.column].get(key) ?? null;
        const rows: PlotTooltipRow[] = [
          ...tooltipRowsOf(fields, sample),
          { label: "Molecule", value: moleculeName(molecule) },
        ];
        if (molecule.formula) rows.push({ label: "Formula", value: molecule.formula });
        if (molecule.precursor_ion_type) rows.push({ label: "Ion Type", value: molecule.precursor_ion_type });
        if (molecule.precursor_mz != null) rows.push({ label: "Precursor m/z", value: molecule.precursor_mz });
        rows.push({ label: "Value", value: rawValue ?? "No data" });
        if (rawValue !== null) rows.push({ label: "Color", value: scale.describe(key, rawValue, domain) });

        return <PlotTooltip title={sample.sample_id} rows={rows} />;
      }}
    />
  );
};

export default ExposomicsQuantificationHeatmap;
