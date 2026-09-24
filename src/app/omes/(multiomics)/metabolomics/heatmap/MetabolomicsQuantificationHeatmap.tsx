import { ColumnDatum } from "@weng-lab/visualization";
import { SharedMetabolomicsProps } from "./page";
import { MetabolomicsSample } from "@/common/hooks/omeHooks/useMetabolomicsQuantification";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import PlotTooltip from "@/common/components/PlotTooltip";
import { zScoreByRow } from "@/common/components/OmeQuantification/zScoreByRow";
import { symmetricColorDomain } from "@/common/components/OmeQuantification/symmetricColorDomain";
import { MISSING_LABEL } from "@/common/colors";

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

  const samples: MetabolomicsSample[] = sortedFilteredData;

  const compounds = Array.from(
    new Map(
      rows.flatMap((sample) => sample.quantification.map((q) => [compoundKey(q.compound, q.mode), q] as const))
    ).values()
  ).sort((a, b) => a.compound.localeCompare(b.compound) || a.mode.localeCompare(b.mode));

  // Scored against the full dataset, not the filtered/displayed columns, so filtering
  // the table doesn't shift the color scale - or collapse it to 0 when down to one column.
  const valueByCompoundPerRow = rows.map(
    (sample) => new Map(sample.quantification.map((q) => [compoundKey(q.compound, q.mode), q.value]))
  );

  const zScoreByCompound = new Map(
    compounds.map((compound) => {
      const key = compoundKey(compound.compound, compound.mode);
      return [key, zScoreByRow(valueByCompoundPerRow.map((valueByCompound) => valueByCompound.get(key) ?? null))];
    })
  );

  const heatmapData: ColumnDatum<MetabolomicsSample, CompoundRowMeta>[] = samples.map((sample) => {
    const valueByCompound = new Map(sample.quantification.map((q) => [compoundKey(q.compound, q.mode), q.value]));
    return {
      columnName: sample.sample_id,
      metadata: sample,
      rows: compounds.map((compound) => {
        const key = compoundKey(compound.compound, compound.mode);
        const rawValue = valueByCompound.get(key) ?? null;
        return {
          rowName: truncateCompoundName(compound.compound),
          count: rawValue === null ? null : zScoreByCompound.get(key)!(rawValue),
          metadata: rawValue === null ? undefined : { fullName: compound.compound, mode: compound.mode, rawValue },
        };
      }),
    };
  });

  // Domain also comes from the full dataset, not just the displayed columns, so the
  // legend's scale doesn't shift as the table is filtered.
  const colorDomain = symmetricColorDomain(
    rows.map((sample, i) => ({
      columnName: sample.sample_id,
      rows: compounds.map((compound) => {
        const key = compoundKey(compound.compound, compound.mode);
        const rawValue = valueByCompoundPerRow[i].get(key) ?? null;
        return { rowName: key, count: rawValue === null ? null : zScoreByCompound.get(key)!(rawValue) };
      }),
    }))
  );

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
      colorDomain={colorDomain}
      ref={ref}
      tooltipBody={(bin) => {
        const rowMeta = bin.bin.metadata as CompoundRowMeta | undefined;
        const sample = bin.datum.metadata as MetabolomicsSample | undefined;
        return (
          <PlotTooltip
            title={bin.datum.columnName}
            rows={[
              { label: "Age", value: sample?.age_bin ?? MISSING_LABEL },
              { label: "Compound", value: rowMeta?.fullName ?? bin.bin.rowName },
              { label: "Mode", value: rowMeta?.mode },
              { label: "Value", value: rowMeta?.rawValue ?? "No data" },
            ]}
          />
        );
      }}
    />
  );
};

export default MetabolomicsQuantificationHeatmap;
