"use client";
import { useMemo } from "react";
import { Heatmap } from "@weng-lab/visualization";
import { type PhenotypicalDataPoint } from "@/common/hooks/usePhenotypicalData";

type Props = {
  rawData: PhenotypicalDataPoint[];
  var1Name: string;
  var2Name: string;
};

export default function CategoricalCategoricalChart({ rawData, var1Name, var2Name }: Props) {
  const heatmapData = useMemo(() => {
    const var1Rows = rawData.filter((p) => p.variable_name === var1Name);
    const var2Rows = rawData.filter((p) => p.variable_name === var2Name);

    const var2Map = new Map<string, string>();
    for (const p of var2Rows) {
      var2Map.set(p.participant_id, p.assigned_category ?? p.value_text ?? "Unknown");
    }

    const var1Cats = [...new Set(var1Rows.map((p) => p.assigned_category ?? p.value_text ?? "Unknown"))].sort();
    const var2Cats = [...new Set(var2Map.values())].sort();

    const counts = new Map<string, Map<string, number>>();
    for (const p of var1Rows) {
      const cat1 = p.assigned_category ?? p.value_text ?? "Unknown";
      const cat2 = var2Map.get(p.participant_id);
      if (!cat2) continue;
      if (!counts.has(cat1)) counts.set(cat1, new Map());
      const inner = counts.get(cat1)!;
      inner.set(cat2, (inner.get(cat2) ?? 0) + 1);
    }

    return var1Cats.map((col) => ({
      columnName: col,
      rows: var2Cats.map((row) => ({
        rowName: row,
        count: counts.get(col)?.get(row) ?? 0,
      })),
    }));
  }, [rawData, var1Name, var2Name]);

  if (heatmapData.length === 0) return null;

  return (
    <Heatmap
      data={heatmapData}
      colors={["#eaf4fb", "#003d38"]}
      xLabel={var1Name.split(".").pop()?.replace(/_/g, " ")}
      yLabel={var2Name.split(".").pop()?.replace(/_/g, " ")}
      downloadFileName={`${var1Name}_${var2Name}_heatmap`}
      isRect
    />
  );
}
