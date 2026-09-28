"use client";
import { Histogram, type DownloadPlotHandle, type HistogramBin } from "@weng-lab/visualization";
import { type PhenotypicalDataPoint } from "@/common/hooks/usePhenotypicalData";
import PlotTooltip from "@/common/components/PlotTooltip";

type Props = {
  rawData: PhenotypicalDataPoint[];
  var1Name: string;
  ref?: React.Ref<DownloadPlotHandle>;
};

type ParsedNumericText = {
  value: number;
  /** The original text ("3 or more") when this came from a top-coded floor rather than a plain number. */
  topCodedLabel?: string;
};

/**
 * Parses a numeric value out of value_text, for variables where the backend still routes
 * every response through value_text (leaving value_numeric null) despite the values being
 * numeric. Handles plain numbers ("0") and top-coded floors ("3 or more" -> 3).
 */
function parseNumericText(text: string): ParsedNumericText | null {
  const trimmed = text.trim();
  if (trimmed !== "" && !Number.isNaN(Number(trimmed))) return { value: Number(trimmed) };
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*or more$/i);
  return match ? { value: Number(match[1]), topCodedLabel: trimmed } : null;
}

export default function QuantitativeHistogram({ rawData, var1Name, ref }: Props) {
  // Keyed by the clamped numeric value, so the tooltip can show the original top-coded text
  // ("3 or more") for the bin it landed in instead of a misleading numeric range.
  const topCodedLabels = new Map<number, string>();

  const values = rawData.flatMap((p) => {
    if (p.variable_name !== var1Name) return [];
    if (p.value_numeric != null) return [p.value_numeric];
    if (p.value_text == null) return [];
    const parsed = parseNumericText(p.value_text);
    if (!parsed) return [];
    if (parsed.topCodedLabel) topCodedLabels.set(parsed.value, parsed.topCodedLabel);
    return [parsed.value];
  });

  if (values.length === 0) return null;

  const tooltipBody =
    topCodedLabels.size > 0
      ? (bin: HistogramBin) => {
          const topCoded = [...topCodedLabels.entries()].find(([value]) => value >= bin.x0 && value < bin.x1);
          const range = topCoded ? topCoded[1] : `${bin.x0.toFixed(2)}, ${bin.x1.toFixed(2)}`;
          return <PlotTooltip title={range} rows={[{ label: "Count", value: bin.count }]} />;
        }
      : undefined;

  return (
    <Histogram
      ref={ref}
      data={values}
      xLabel={var1Name.split(".").pop()?.replace(/_/g, " ")}
      yLabel="Count"
      downloadFileName={`${var1Name.replace(/\./g, "_")}_histogram`}
      densityLine
      animationType="slideUp"
      color="#e67e22"
      densityLineColor="#e74c3c"
      tooltipBody={tooltipBody}
    />
  );
}
