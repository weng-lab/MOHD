import { useState } from "react";
import { ColumnDatum } from "@weng-lab/visualization";
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
import PlotTooltip from "@/common/components/PlotTooltip";
import { MISSING_LABEL } from "@/common/colors";

const truncateMoleculeName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

type MoleculeRowMeta = { fullName: string; rawValue: number };

const valueByMolecule = (sample: LipidomicsSample) =>
  new Map(sample.quantification.map((q) => [q.molecule_name, q.value]));

const LipidomicsQuantificationHeatmap = ({ lipidomicsData, sampleTable, ref }: SharedLipidomicsProps) => {
  const { loading } = lipidomicsData;
  // Every sample, which each row's scale is fitted to, and the table's, in its order, as the columns.
  const { samples: rows, inTableOrder: samples, selected, setSelected, autoSort } = sampleTable;
  const [scaleMode, setScaleMode] = useState<HeatmapScaleMode>("zscore");

  const molecules = Array.from(
    new Set(rows.flatMap((sample) => sample.quantification.map((q) => q.molecule_name)))
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
      total={rows.length}
      controls={<HeatmapScaleToggle modes={Z_SCORED_MODES} value={scaleMode} onChange={setScaleMode} />}
      ref={ref}
      tooltipBody={(bin, domain) => {
        const rowMeta = bin.bin.metadata as MoleculeRowMeta | undefined;
        const sample = bin.datum.metadata as LipidomicsSample | undefined;
        return (
          <PlotTooltip
            title={bin.datum.columnName}
            rows={[
              { label: "Age", value: sample?.age_bin ?? MISSING_LABEL },
              { label: "Molecule", value: rowMeta?.fullName ?? bin.bin.rowName },
              { label: "Value", value: rowMeta?.rawValue ?? "No data" },
              ...(rowMeta
                ? [{ label: "Color", value: scale.describe(rowMeta.fullName, rowMeta.rawValue, domain) }]
                : []),
            ]}
          />
        );
      }}
    />
  );
};

export default LipidomicsQuantificationHeatmap;
