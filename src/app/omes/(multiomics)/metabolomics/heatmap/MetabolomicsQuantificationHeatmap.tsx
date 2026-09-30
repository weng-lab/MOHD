import { useState } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { SharedMetabolomicsProps } from "./page";
import { MetabolomicsSample } from "@/common/hooks/omeHooks/useMetabolomicsQuantification";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import HeatmapScaleToggle from "@/common/components/OmeQuantification/HeatmapScaleToggle";
import {
  buildHeatmapColorScale,
  HeatmapScaleMode,
  valuesByRow,
  Z_SCORED_MODES,
} from "@/common/components/OmeQuantification/heatmapColorScale";
import PlotTooltip from "@/common/components/PlotTooltip";
import { tooltipRowsOf } from "@/common/sampleFields/fields";

const compoundKey = (compound: string, mode: string) => `${compound}::${mode}`;
const truncateCompoundName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

type CompoundRowMeta = { fullName: string; mode: string; rawValue: number };

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

  const heatmapData: ColumnDatum<MetabolomicsSample, CompoundRowMeta>[] = samples.map((sample, sampleIndex) => ({
    columnName: sample.sample_id,
    metadata: sample,
    rows: compounds.map((compound, compoundIndex) => {
      const key = compoundKeys[compoundIndex];
      const rawValue = valueByCompoundPerSample[sampleIndex].get(key) ?? null;
      return {
        rowName: truncateCompoundName(compound.compound),
        // Unclamped where a colorbar can move the range: the heatmap holds colors at its ends itself.
        count: rawValue === null ? null : (scale.colorbar?.value ?? scale.toCount)(key, rawValue),
        metadata: rawValue === null ? undefined : { fullName: compound.compound, mode: compound.mode, rawValue },
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
      yLabel="Compound"
      downloadFileName="metabolomics_quantification_heatmap"
      colors={scale.colors}
      colorDomain={scale.colorDomain}
      colorbar={scale.colorbar}
      total={rows.length}
      controls={<HeatmapScaleToggle modes={Z_SCORED_MODES} value={scaleMode} onChange={setScaleMode} />}
      ref={ref}
      tooltipBody={(bin, domain) => {
        const rowMeta = bin.bin.metadata as CompoundRowMeta | undefined;
        const sample = bin.datum.metadata as MetabolomicsSample | undefined;
        return (
          <PlotTooltip
            title={bin.datum.columnName}
            rows={[
              ...(sample ? tooltipRowsOf(fields, sample) : []),
              { label: "Compound", value: rowMeta?.fullName ?? bin.bin.rowName },
              { label: "Mode", value: rowMeta?.mode },
              { label: "Value", value: rowMeta?.rawValue ?? "No data" },
              ...(rowMeta
                ? [
                    {
                      label: "Color",
                      value: scale.describe(compoundKey(rowMeta.fullName, rowMeta.mode), rowMeta.rawValue, domain),
                    },
                  ]
                : []),
            ]}
          />
        );
      }}
    />
  );
};

export default MetabolomicsQuantificationHeatmap;
