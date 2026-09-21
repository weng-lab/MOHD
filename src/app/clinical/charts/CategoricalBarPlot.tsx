"use client";
import { useMediaQuery, useTheme } from "@mui/material";
import { BarPlot, type BarData, type DownloadPlotHandle } from "@weng-lab/visualization";
import { type PhenotypicalDataPoint } from "@/common/hooks/usePhenotypicalData";
import { BAR_PLOT_COLORS } from "@/common/colors";

type Props = {
  rawData: PhenotypicalDataPoint[];
  var1Name: string;
  ref?: React.Ref<DownloadPlotHandle>;
};

export default function CategoricalBarPlot({ rawData, var1Name, ref }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const counts = new Map<string, number>();
  for (const p of rawData) {
    if (p.variable_name !== var1Name || p.value_text == null) continue;
    counts.set(p.value_text, (counts.get(p.value_text) ?? 0) + 1);
  }

  const barData: BarData<{ count: number }>[] = Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([label, count], i) => {
      const category = label.replace(/_/g, " ");
      return {
        id: i.toString(),
        value: count,
        label: count.toString(),
        category: isMobile && category.length > 8 ? `${category.slice(0, 8)}…` : category,
        color: BAR_PLOT_COLORS[i % BAR_PLOT_COLORS.length],
        metadata: { count },
      };
    });

  if (barData.length === 0) return null;

  return (
    <BarPlot
      ref={ref}
      data={barData}
      topAxisLabel="Count"
      downloadFileName={`${var1Name.replace(/\./g, "_")}_distribution`}
      animation="slideRight"
      animationBuffer={0.01}
      barSpacing={isMobile ? 3 : 5}
      barSize={isMobile ? 24 : 40}
    />
  );
}
