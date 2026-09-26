import { useState } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
import { Typography } from "@mui/material";
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

const ExposomicsQuantificationHeatmap = ({
  rows,
  exposomicsData,
  sortedFilteredData,
  selected,
  setSelected,
  autoSort,
  ref,
}: SharedExposomicsProps) => {
  const { loading } = exposomicsData;
  const [scaleMode, setScaleMode] = useState<HeatmapScaleMode>("zscore");

  const samples: ExposomicsSample[] = sortedFilteredData;

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
      header={<HeatmapScaleToggle modes={EXPOSOMICS_MODES} value={scaleMode} onChange={setScaleMode} />}
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
            {rowMeta?.formula ? (
              <Typography>
                <b>Formula:</b> {rowMeta.formula}
              </Typography>
            ) : null}
            {rowMeta?.ionType ? (
              <Typography>
                <b>Ion Type:</b> {rowMeta.ionType}
              </Typography>
            ) : null}
            {rowMeta?.precursorMz != null ? (
              <Typography>
                <b>Precursor m/z:</b> {rowMeta.precursorMz}
              </Typography>
            ) : null}
            <Typography>
              <b>Value:</b> {rowMeta?.rawValue ?? "No data"}
            </Typography>
            {rowMeta?.rawValue != null && (
              <Typography>
                <b>Color:</b> {scale.describe(rowMeta.key, rowMeta.rawValue, domain)}
              </Typography>
            )}
          </>
        );
      }}
    />
  );
};

export default ExposomicsQuantificationHeatmap;
