import { useState } from "react";
import { SharedMetabolomicsProps } from "./page";
import { MetabolomicsSample } from "@/common/hooks/omeHooks/useMetabolomicsQuantification";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import HeatmapScaleToggle from "@/common/components/OmeQuantification/HeatmapScaleToggle";
import {
  buildHeatmapColorScale,
  heatmapValues,
  HeatmapScaleMode,
  valuesByRow,
  Z_SCORED_MODES,
} from "@/common/components/OmeQuantification/heatmapColorScale";
import PlotTooltip from "@/common/components/PlotTooltip";
import { tooltipRowsOf } from "@/common/sampleFields/fields";

const compoundKey = (compound: string, mode: string) => `${compound}::${mode}`;

const valueByCompound = (sample: MetabolomicsSample) =>
  new Map(sample.quantification.map((q) => [compoundKey(q.compound, q.mode), q.value]));

const MetabolomicsQuantificationHeatmap = ({ metabolomicsData, sampleTable, ref }: SharedMetabolomicsProps) => {
  const { loading } = metabolomicsData;
  // Every plotted sample, which each row's scale is fitted to, and the table's, in its order, as the columns.
  const { plotted: rows, inTableOrder: samples, fields, selected, setSelected, autoSort } = sampleTable;
  const [scaleMode, setScaleMode] = useState<HeatmapScaleMode>("zscore");

  const compounds = Array.from(
    new Map(
      rows.flatMap((sample) => sample.quantification.map((q) => [compoundKey(q.compound, q.mode), q] as const))
    ).values()
  ).sort((a, b) => a.compound.localeCompare(b.compound) || a.mode.localeCompare(b.mode));
  const compoundKeys = compounds.map((compound) => compoundKey(compound.compound, compound.mode));

  const valueByCompoundPerSample = samples.map(valueByCompound);

  const scale = buildHeatmapColorScale(scaleMode, valuesByRow(compoundKeys, rows.map(valueByCompound)), "compound");
  const values = heatmapValues(scale, compoundKeys, valueByCompoundPerSample);

  return (
    <OmeHeatmapShell
      loading={loading}
      samples={samples}
      rowNames={compounds.map((compound) => compound.compound)}
      values={values}
      selected={selected}
      setSelected={setSelected}
      autoSort={autoSort}
      yLabel="Compound"
      downloadFileName="metabolomics_quantification_heatmap"
      colors={scale.colors}
      colorDomain={scale.colorDomain}
      colorbar={scale.colorbar}
      total={rows.length}
      controls={<HeatmapScaleToggle modes={Z_SCORED_MODES} value={scaleMode} onChange={setScaleMode} />}
      ref={ref}
      tooltipBody={(cell, domain) => {
        const sample = samples[cell.column];
        const compound = compounds[cell.row];
        const key = compoundKeys[cell.row];
        const rawValue = valueByCompoundPerSample[cell.column].get(key) ?? null;
        return (
          <PlotTooltip
            title={sample.sample_id}
            rows={[
              ...tooltipRowsOf(fields, sample),
              { label: "Compound", value: compound.compound },
              { label: "Mode", value: compound.mode },
              { label: "Value", value: rawValue ?? "No data" },
              ...(rawValue === null ? [] : [{ label: "Color", value: scale.describe(key, rawValue, domain) }]),
            ]}
          />
        );
      }}
    />
  );
};

export default MetabolomicsQuantificationHeatmap;
