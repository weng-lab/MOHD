import { useState } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { Typography } from "@mui/material";
import { MetallomicsSample, SharedMetallomicsProps } from "./page";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import HeatmapScaleToggle from "@/common/components/OmeQuantification/HeatmapScaleToggle";
import {
  buildHeatmapColorScale,
  HeatmapScaleMode,
  valuesByRow,
  Z_SCORED_MODES,
} from "@/common/components/OmeQuantification/heatmapColorScale";

export type MetalGroup = "base" | "ucr";

/**
 * "ucr" selects metals normalized to urine creatinine (name ends in "_UCr").
 * "base" selects everything else, including the standalone "UCr" measurement itself.
 */
const isInGroup = (metal: string, metalGroup: MetalGroup) =>
  metalGroup === "ucr" ? metal.endsWith("_UCr") : !metal.endsWith("_UCr");

type MetalRowMeta = { rawValue: number };

type MetallomicsQuantificationHeatmapProps = SharedMetallomicsProps & {
  metalGroup: MetalGroup;
  downloadFileName: string;
};

const MetallomicsQuantificationHeatmap = ({
  rows,
  metallomicsData,
  sortedFilteredData,
  selected,
  setSelected,
  autoSort,
  metalGroup,
  downloadFileName,
  ref,
}: MetallomicsQuantificationHeatmapProps) => {
  const { loading } = metallomicsData;
  const [scaleMode, setScaleMode] = useState<HeatmapScaleMode>("zscore");

  const samples: MetallomicsSample[] = sortedFilteredData;

  const metals = Array.from(
    new Set(
      samples.flatMap((sample) =>
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

  const heatmapData: ColumnDatum<MetallomicsSample, MetalRowMeta>[] = samples.map((sample, sampleIndex) => ({
    columnName: sample.sample_id,
    metadata: sample,
    rows: metals.map((metal) => {
      const rawValue = valueByMetalPerSample[sampleIndex].get(metal) ?? null;
      return {
        rowName: metal,
        // Unclamped where a colorbar can move the range: the heatmap holds colors at its ends itself.
        count: rawValue === null ? null : (scale.colorbar?.value ?? scale.toCount)(metal, rawValue),
        metadata: rawValue === null ? undefined : { rawValue },
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
      yLabel="Metal"
      downloadFileName={downloadFileName}
      colors={scale.colors}
      colorDomain={scale.colorDomain}
      colorbar={scale.colorbar}
      header={<HeatmapScaleToggle modes={Z_SCORED_MODES} value={scaleMode} onChange={setScaleMode} />}
      ref={ref}
      tooltipBody={(bin, domain) => {
        const rowMeta = bin.bin.metadata as MetalRowMeta | undefined;
        return (
          <>
            <Typography>
              <b>Dataset:</b> {bin.datum.columnName}
            </Typography>
            <Typography>
              <b>Metal:</b> {bin.bin.rowName}
            </Typography>
            <Typography>
              <b>Value:</b> {rowMeta?.rawValue ?? "No data"}
            </Typography>
            {rowMeta && (
              <Typography>
                <b>Color:</b> {scale.describe(bin.bin.rowName, rowMeta.rawValue, domain)}
              </Typography>
            )}
          </>
        );
      }}
    />
  );
};

export default MetallomicsQuantificationHeatmap;
