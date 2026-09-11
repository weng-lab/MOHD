"use client";
import { BarPlot, type BarData } from "@weng-lab/visualization";
import { type PhenotypicalDataPoint } from "@/common/hooks/usePhenotypicalData";
import { BAR_PLOT_COLORS } from "@/common/colors";

type Props = {
  rawData: PhenotypicalDataPoint[];
  var1Name: string;
};

export default function CategoricalBarPlot({ rawData, var1Name }: Props) {
  const counts = new Map<string, number>();
  for (const p of rawData) {
    if (p.variable_name !== var1Name || p.value_text == null) continue;
    counts.set(p.value_text, (counts.get(p.value_text) ?? 0) + 1);
  }

  const barData: BarData<{ count: number }>[] = Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([label, count], i) => ({
      id: i.toString(),
      value: count,
      label: count.toString(),
      category: label.replace(/_/g, " "),
      color: BAR_PLOT_COLORS[i % BAR_PLOT_COLORS.length],
      metadata: { count },
    }));

  if (barData.length === 0) return null;

  return (
    <BarPlot
      data={barData}
      topAxisLabel="Count"
      downloadFileName={`${var1Name}_distribution`}
      animation="slideRight"
      animationBuffer={0.01}
      barSpacing={5}
      barSize={40}
    />
  );
}
