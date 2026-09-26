import { useState } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { Typography } from "@mui/material";
import { SharedLipidomicsProps } from "./page";
import { LipidomicsSample } from "@/common/hooks/omeHooks/useLipidomicsQuantification";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import HeatmapScaleToggle from "@/common/components/OmeQuantification/HeatmapScaleToggle";
import {
  buildHeatmapColorScale,
  HeatmapScaleMode,
  valuesByRow,
  Z_SCORED_MODES,
} from "@/common/components/OmeQuantification/heatmapColorScale";

const truncateMoleculeName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

type MoleculeRowMeta = { fullName: string; rawValue: number };

const valueByMolecule = (sample: LipidomicsSample) =>
  new Map(sample.quantification.map((q) => [q.molecule_name, q.value]));

const LipidomicsQuantificationHeatmap = ({
  rows,
  lipidomicsData,
  sortedFilteredData,
  selected,
  setSelected,
  autoSort,
  ref,
}: SharedLipidomicsProps) => {
  const { loading } = lipidomicsData;
  const [scaleMode, setScaleMode] = useState<HeatmapScaleMode>("zscore");

  const samples: LipidomicsSample[] = sortedFilteredData;

  const molecules = Array.from(
    new Set(samples.flatMap((sample) => sample.quantification.map((q) => q.molecule_name)))
  ).sort();

  const valueByMoleculePerSample = samples.map(valueByMolecule);

  const scale = buildHeatmapColorScale(scaleMode, valuesByRow(molecules, rows.map(valueByMolecule)), "lipid");

  const heatmapData: ColumnDatum<LipidomicsSample, MoleculeRowMeta>[] = samples.map((sample, sampleIndex) => ({
    columnName: sample.sample_id,
    metadata: sample,
    rows: molecules.map((molecule) => {
      const rawValue = valueByMoleculePerSample[sampleIndex].get(molecule) ?? null;
      return {
        rowName: truncateMoleculeName(molecule),
        // Unclamped where a colorbar can move the range: the heatmap holds colors at its ends itself.
        count: rawValue === null ? null : (scale.colorbar?.value ?? scale.toCount)(molecule, rawValue),
        metadata: rawValue === null ? undefined : { fullName: molecule, rawValue },
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
      downloadFileName="lipidomics_quantification_heatmap"
      colors={scale.colors}
      colorDomain={scale.colorDomain}
      colorbar={scale.colorbar}
      header={<HeatmapScaleToggle modes={Z_SCORED_MODES} value={scaleMode} onChange={setScaleMode} />}
      ref={ref}
      tooltipBody={(bin, domain) => {
        const rowMeta = bin.bin.metadata as MoleculeRowMeta | undefined;
        return (
          <>
            <Typography>
              <b>Dataset:</b> {bin.datum.columnName}
            </Typography>
            <Typography>
              <b>Molecule:</b> {rowMeta?.fullName ?? bin.bin.rowName}
            </Typography>
            <Typography>
              <b>Value:</b> {rowMeta?.rawValue ?? "No data"}
            </Typography>
            {rowMeta && (
              <Typography>
                <b>Color:</b> {scale.describe(rowMeta.fullName, rowMeta.rawValue, domain)}
              </Typography>
            )}
          </>
        );
      }}
    />
  );
};

export default LipidomicsQuantificationHeatmap;
