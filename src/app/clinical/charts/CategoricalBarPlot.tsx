"use client";
import { useMemo } from "react";
import { BarPlot, type BarData } from "@weng-lab/visualization";
import { type PhenotypicalDataPoint } from "@/common/hooks/usePhenotypicalData";

const COLORS = ["#d502f9", "#2196f4", "#25a69a", "#7b1fa3", "#e67e22", "#e74c3c"];

type Props = {
  rawData: PhenotypicalDataPoint[];
  var1Name: string;
};

export default function CategoricalBarPlot({ rawData, var1Name }: Props) {
  const barData: BarData<{ count: number }>[] = useMemo(() => {
    const rows = rawData.filter((p) => p.variable_name === var1Name);
    const counts = new Map<string, number>();
    for (const p of rows) {
      const key = p.assigned_category ?? p.value_text ?? "Unknown";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([label, count], i) => ({
        id: i.toString(),
        value: count,
        label: count.toString(),
        category: label.replace(/_/g, " "),
        color: COLORS[i % COLORS.length],
        metadata: { count },
      }));
  }, [rawData, var1Name]);

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
