import { useState } from "react";
import { SharedLipidomicsProps } from "./page";
import { LipidomicsSample } from "@/common/hooks/omeHooks/useLipidomicsQuantification";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import HeatmapScaleToggle from "@/common/components/OmeQuantification/HeatmapScaleToggle";
import HeatmapQcToggle from "@/common/components/OmeQuantification/HeatmapQcToggle";
import {
  buildHeatmapColorScale,
  heatmapValues,
  HeatmapScaleMode,
  valuesByRow,
  Z_SCORED_MODES,
} from "@/common/components/OmeQuantification/heatmapColorScale";
import PlotTooltip from "@/common/components/PlotTooltip";
import { tooltipRowsOf } from "@/common/sampleFields/fields";

const valueByMolecule = (sample: LipidomicsSample) =>
  new Map(sample.quantification.map((q) => [q.molecule_name, q.value]));

const LipidomicsQuantificationHeatmap = ({ lipidomicsData, sampleTable, ref }: SharedLipidomicsProps) => {
  const { loading } = lipidomicsData;
  // Every plotted sample, which each row's scale is fitted to, and the table's, in its order, as the columns.
  const { plotted: rows, inTableOrder: samples, fields, selected, setSelected, autoSort } = sampleTable;
  const [scaleMode, setScaleMode] = useState<HeatmapScaleMode>("zscore");

  const molecules = Array.from(
    new Set(rows.flatMap((sample) => sample.quantification.map((q) => q.molecule_name)))
  ).sort();

  const valueByMoleculePerSample = samples.map(valueByMolecule);

  const scale = buildHeatmapColorScale(scaleMode, valuesByRow(molecules, rows.map(valueByMolecule)), "lipid");
  const values = heatmapValues(scale, molecules, valueByMoleculePerSample);

  return (
    <OmeHeatmapShell
      loading={loading}
      samples={samples}
      rowNames={molecules}
      values={values}
      selected={selected}
      setSelected={setSelected}
      autoSort={autoSort}
      yLabel="Molecule"
      downloadFileName="lipidomics_quantification_heatmap"
      colors={scale.colors}
      colorDomain={scale.colorDomain}
      colorbar={scale.colorbar}
      total={rows.length}
      controls={
        <>
          <HeatmapScaleToggle modes={Z_SCORED_MODES} value={scaleMode} onChange={setScaleMode} />
          <HeatmapQcToggle table={sampleTable} />
        </>
      }
      ref={ref}
      tooltipBody={(cell, domain) => {
        const sample = samples[cell.column];
        const molecule = molecules[cell.row];
        const rawValue = valueByMoleculePerSample[cell.column].get(molecule) ?? null;
        return (
          <PlotTooltip
            title={sample.sample_id}
            rows={[
              ...tooltipRowsOf(fields, sample),
              { label: "Molecule", value: molecule },
              { label: "Value", value: rawValue ?? "No data" },
              ...(rawValue === null ? [] : [{ label: "Color", value: scale.describe(molecule, rawValue, domain) }]),
            ]}
          />
        );
      }}
    />
  );
};

export default LipidomicsQuantificationHeatmap;
