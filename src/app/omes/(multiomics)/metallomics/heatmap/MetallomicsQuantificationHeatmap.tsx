import { ColumnDatum } from "@weng-lab/visualization";
import { MetallomicsSample, SharedMetallomicsProps } from "./page";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";
import PlotTooltip from "@/common/components/PlotTooltip";
import { zScoreByRow } from "@/common/components/OmeQuantification/zScoreByRow";
import { symmetricColorDomain } from "@/common/components/OmeQuantification/symmetricColorDomain";
import { MISSING_LABEL } from "@/common/colors";

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

  const samples: MetallomicsSample[] = sortedFilteredData;

  const metals = Array.from(
    new Set(
      rows.flatMap((sample) =>
        sample.quantification
          .filter((q): q is NonNullable<typeof q> => q !== null && isInGroup(q.metal, metalGroup))
          .map((q) => q.metal)
      )
    )
  ).sort();

  // Scored against the full dataset, not the filtered/displayed columns, so filtering
  // the table doesn't shift the color scale - or collapse it to 0 when down to one column.
  const valueByMetalPerRow = rows.map(
    (sample) =>
      new Map(
        sample.quantification
          .filter((q): q is NonNullable<typeof q> => q !== null && isInGroup(q.metal, metalGroup))
          .map((q) => [q.metal, q.value])
      )
  );

  const zScoreByMetal = new Map(
    metals.map((metal) => [
      metal,
      zScoreByRow(valueByMetalPerRow.map((valueByMetal) => valueByMetal.get(metal) ?? null)),
    ])
  );

  const heatmapData: ColumnDatum<MetallomicsSample, MetalRowMeta>[] = samples.map((sample) => {
    const valueByMetal = new Map(
      sample.quantification
        .filter((q): q is NonNullable<typeof q> => q !== null && isInGroup(q.metal, metalGroup))
        .map((q) => [q.metal, q.value])
    );
    return {
      columnName: sample.sample_id,
      metadata: sample,
      rows: metals.map((metal) => {
        const rawValue = valueByMetal.get(metal) ?? null;
        return {
          rowName: metal,
          count: rawValue === null ? null : zScoreByMetal.get(metal)!(rawValue),
          metadata: rawValue === null ? undefined : { rawValue },
        };
      }),
    };
  });

  // Domain also comes from the full dataset, not just the displayed columns, so the
  // legend's scale doesn't shift as the table is filtered.
  const colorDomain = symmetricColorDomain(
    rows.map((sample, i) => ({
      columnName: sample.sample_id,
      rows: metals.map((metal) => {
        const rawValue = valueByMetalPerRow[i].get(metal) ?? null;
        return { rowName: metal, count: rawValue === null ? null : zScoreByMetal.get(metal)!(rawValue) };
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
      yLabel="Metal"
      downloadFileName={downloadFileName}
      colorDomain={colorDomain}
      ref={ref}
      tooltipBody={(bin) => (
        <PlotTooltip
          title={bin.datum.columnName}
          rows={[
            { label: "Age", value: (bin.datum.metadata as MetallomicsSample | undefined)?.age_bin ?? MISSING_LABEL },
            { label: "Metal", value: bin.bin.rowName },
            { label: "Value", value: (bin.bin.metadata as MetalRowMeta | undefined)?.rawValue ?? "No data" },
          ]}
        />
      )}
    />
  );
};

export default MetallomicsQuantificationHeatmap;
