import { useState } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { SharedMetabolomicsProps } from "./page";
import { MetabolomicsSample } from "@/common/hooks/omeHooks/useMetabolomicsQuantification";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import {
  buildHeatmapColorScale,
  HEATMAP_SCALE_MODES,
  HeatmapScaleMode,
} from "@/common/components/OmeQuantification/heatmapColorScale";

const compoundKey = (compound: string, mode: string) => `${compound}::${mode}`;
const truncateCompoundName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

type CompoundRowMeta = { fullName: string; mode: string; rawValue: number };

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

  const valueByCompoundPerSample = samples.map(
    (sample) => new Map(sample.quantification.map((q) => [compoundKey(q.compound, q.mode), q.value]))
  );

  /** Each compound's values across the given samples, in the shape the color scale takes. */
  const valuesByCompound = (valueMaps: Map<string, number | null>[]) =>
    new Map(
      compounds.map((compound) => {
        const key = compoundKey(compound.compound, compound.mode);
        return [key, valueMaps.map((valueByCompound) => valueByCompound.get(key) ?? null)];
      })
    );

  const allValueMaps = rows.map(
    (sample) => new Map(sample.quantification.map((q) => [compoundKey(q.compound, q.mode), q.value]))
  );

  const scale = buildHeatmapColorScale(
    scaleMode,
    valuesByCompound(allValueMaps),
    valuesByCompound(valueByCompoundPerSample),
    "compound"
  );

  const heatmapData: ColumnDatum<MetabolomicsSample, CompoundRowMeta>[] = samples.map((sample, sampleIndex) => ({
    columnName: sample.sample_id,
    metadata: sample,
    rows: compounds.map((compound) => {
      const key = compoundKey(compound.compound, compound.mode);
      const rawValue = valueByCompoundPerSample[sampleIndex].get(key) ?? null;
      return {
        rowName: truncateCompoundName(compound.compound),
        count: rawValue === null ? null : scale.toCount(key, rawValue),
        metadata: rawValue === null ? undefined : { fullName: compound.compound, mode: compound.mode, rawValue },
      };
    }),
  }));

  return (
    <Stack width="100%" height="100%">
      <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap" sx={{ pb: 1 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          color="primary"
          value={scaleMode}
          onChange={(_, value: HeatmapScaleMode | null) => value && setScaleMode(value)}
          aria-label="Color scale"
        >
          {HEATMAP_SCALE_MODES.map(({ mode, label }) => (
            <ToggleButton key={mode} value={mode}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary" sx={{ flex: "1 1 280px" }}>
          {scale.caption}
        </Typography>
      </Stack>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
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
      </Box>
    </Stack>
  );
};

export default MetabolomicsQuantificationHeatmap;
