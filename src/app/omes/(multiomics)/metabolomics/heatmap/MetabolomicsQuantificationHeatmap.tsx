import { useState } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { Typography } from "@mui/material";
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

const compoundKey = (compound: string, mode: string) => `${compound}::${mode}`;
const truncateCompoundName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

type CompoundRowMeta = { fullName: string; mode: string; rawValue: number };

const valueByCompound = (sample: MetabolomicsSample) =>
  new Map(sample.quantification.map((q) => [compoundKey(q.compound, q.mode), q.value]));

const MetabolomicsQuantificationHeatmap = ({
  rows,
  metabolomicsData,
  sortedFilteredData,
  selected,
  setSelected,
  autoSort,
  ref,
}: SharedMetabolomicsProps) => {
  const { loading } = metabolomicsData;
  const [scaleMode, setScaleMode] = useState<HeatmapScaleMode>("zscore");

  const samples: MetabolomicsSample[] = sortedFilteredData;

  const compounds = Array.from(
    new Map(
      samples.flatMap((sample) => sample.quantification.map((q) => [compoundKey(q.compound, q.mode), q] as const))
    ).values()
  ).sort((a, b) => a.compound.localeCompare(b.compound) || a.mode.localeCompare(b.mode));
  const compoundKeys = compounds.map((compound) => compoundKey(compound.compound, compound.mode));

  const valueByCompoundPerSample = samples.map(valueByCompound);

  const scale = buildHeatmapColorScale(
    scaleMode,
    valuesByRow(compoundKeys, rows.map(valueByCompound)),
    valuesByRow(compoundKeys, valueByCompoundPerSample),
    "compound"
  );

  const heatmapData: ColumnDatum<MetabolomicsSample, CompoundRowMeta>[] = samples.map((sample, sampleIndex) => ({
    columnName: sample.sample_id,
    metadata: sample,
    rows: compounds.map((compound, compoundIndex) => {
      const key = compoundKeys[compoundIndex];
      const rawValue = valueByCompoundPerSample[sampleIndex].get(key) ?? null;
      return {
        rowName: truncateCompoundName(compound.compound),
        count: rawValue === null ? null : scale.toCount(key, rawValue),
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
      header={
        <HeatmapScaleToggle modes={Z_SCORED_MODES} value={scaleMode} onChange={setScaleMode} caption={scale.caption} />
      }
      ref={ref}
      tooltipBody={(bin) => {
        const rowMeta = bin.bin.metadata as CompoundRowMeta | undefined;
        return (
          <>
            <Typography>
              <b>Dataset:</b> {bin.datum.columnName}
            </Typography>
            <Typography>
              <b>Compound:</b> {rowMeta?.fullName ?? bin.bin.rowName}
            </Typography>
            <Typography>
              <b>Mode:</b> {rowMeta?.mode}
            </Typography>
            <Typography>
              <b>Value:</b> {rowMeta?.rawValue ?? "No data"}
            </Typography>
            {rowMeta && (
              <Typography>
                <b>Color:</b> {scale.describe(compoundKey(rowMeta.fullName, rowMeta.mode), rowMeta.rawValue)}
              </Typography>
            )}
          </>
        );
      }}
    />
  );
};

export default MetabolomicsQuantificationHeatmap;
