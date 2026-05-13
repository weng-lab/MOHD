"use client";
import { useMemo } from "react";
import { Histogram } from "@weng-lab/visualization";

type HistogramSeries = { values: number[]; label: string; color: string };
import { type PhenotypicalDataPoint } from "@/common/hooks/usePhenotypicalData";

const COLORS = ["#d502f9", "#2196f4", "#25a69a", "#7b1fa3", "#e67e22", "#e74c3c"];

type Props = {
  rawData: PhenotypicalDataPoint[];
  catVarName: string;
  quantVarName: string;
};

export default function CategoricalQuantitativePlot({ rawData, catVarName, quantVarName }: Props) {
  const series: HistogramSeries[] = useMemo(() => {
    const catRows = rawData.filter((p) => p.variable_name === catVarName);
    const quantRows = rawData.filter((p) => p.variable_name === quantVarName);

    const quantMap = new Map<string, number>();
    for (const p of quantRows) {
      if (p.value_numeric != null) quantMap.set(p.participant_id, p.value_numeric);
    }

    const groups = new Map<string, number[]>();
    for (const p of catRows) {
      const cat = p.assigned_category ?? p.value_text ?? "Unknown";
      const num = quantMap.get(p.participant_id);
      if (num == null) continue;
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(num);
    }

    return Array.from(groups.entries()).map(([label, values], i) => ({
      label,
      values,
      color: COLORS[i % COLORS.length],
    }));
  }, [rawData, catVarName, quantVarName]);

  if (series.length === 0) return null;

  return (
    <Histogram
      data={series}
      xLabel={quantVarName.split(".").pop()?.replace(/_/g, " ")}
      yLabel="Count"
      downloadFileName={`${catVarName}_${quantVarName}_histogram`}
      densityLine
      animationType="slideUp"
    />
  );
}
