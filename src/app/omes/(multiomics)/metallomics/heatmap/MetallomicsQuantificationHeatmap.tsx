import { useState } from "react";
import { SharedMetallomicsProps } from "./page";
import { MetallomicsSample } from "@/common/hooks/omeHooks/useMetallomicsData";
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

export type MetalGroup = "base" | "ucr";

/**
 * "ucr" selects metals normalized to urine creatinine (name ends in "_UCr").
 * "base" selects everything else, including the standalone "UCr" measurement itself.
 */
const isInGroup = (metal: string, metalGroup: MetalGroup) =>
  metalGroup === "ucr" ? metal.endsWith("_UCr") : !metal.endsWith("_UCr");

type MetallomicsQuantificationHeatmapProps = SharedMetallomicsProps & {
  metalGroup: MetalGroup;
  downloadFileName: string;
};

const MetallomicsQuantificationHeatmap = ({
  metallomicsData,
  sampleTable,
  metalGroup,
  downloadFileName,
  ref,
}: MetallomicsQuantificationHeatmapProps) => {
  const { loading } = metallomicsData;
  // Every plotted sample, which each row's scale is fitted to, and the table's, in its order, as the columns.
  const { plotted: rows, inTableOrder: samples, fields, selected, setSelected, autoSort } = sampleTable;
  const [scaleMode, setScaleMode] = useState<HeatmapScaleMode>("zscore");

  const metals = Array.from(
    new Set(
      rows.flatMap((sample) =>
        sample.quantification
          .filter((q): q is NonNullable<typeof q> => q !== null && isInGroup(q.metal, metalGroup))
          .map((q) => q.metal)
      )
    )
  ).sort();

  const valueByMetal = (sample: MetallomicsSample) =>
    new Map(
      sample.quantification
        .filter((q): q is NonNullable<typeof q> => q !== null && isInGroup(q.metal, metalGroup))
        .map((q) => [q.metal, q.value])
    );

  const valueByMetalPerSample = samples.map(valueByMetal);

  const scale = buildHeatmapColorScale(scaleMode, valuesByRow(metals, rows.map(valueByMetal)), "metal");
  const values = heatmapValues(scale, metals, valueByMetalPerSample);

  return (
    <OmeHeatmapShell
      loading={loading}
      samples={samples}
      rowNames={metals}
      values={values}
      selected={selected}
      setSelected={setSelected}
      autoSort={autoSort}
      yLabel="Metal"
      downloadFileName={downloadFileName}
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
        const metal = metals[cell.row];
        const rawValue = valueByMetalPerSample[cell.column].get(metal) ?? null;
        return (
          <PlotTooltip
            title={sample.sample_id}
            rows={[
              ...tooltipRowsOf(fields, sample),
              { label: "Metal", value: metal },
              { label: "Value", value: rawValue ?? "No data" },
              ...(rawValue === null ? [] : [{ label: "Color", value: scale.describe(metal, rawValue, domain) }]),
            ]}
          />
        );
      }}
    />
  );
};

export default MetallomicsQuantificationHeatmap;
