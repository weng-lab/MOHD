"use client";
import { Histogram } from "@weng-lab/visualization";
import { type PhenotypicalDataPoint } from "@/common/hooks/usePhenotypicalData";

type Props = {
  rawData: PhenotypicalDataPoint[];
  var1Name: string;
};

/**
 * Parses a numeric value out of value_text, for variables where the backend still routes
 * every response through value_text (leaving value_numeric null) despite the values being
 * numeric. Handles plain numbers ("0") and top-coded floors ("3 or more" -> 3).
 */
function parseNumericText(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed !== "" && !Number.isNaN(Number(trimmed))) return Number(trimmed);
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*or more$/i);
  return match ? Number(match[1]) : null;
}

export default function QuantitativeHistogram({ rawData, var1Name }: Props) {
  const values = rawData.flatMap((p) => {
    if (p.variable_name !== var1Name) return [];
    if (p.value_numeric != null) return [p.value_numeric];
    const parsed = p.value_text != null ? parseNumericText(p.value_text) : null;
    return parsed != null ? [parsed] : [];
  });

  if (values.length === 0) return null;

  return (
    <Histogram
      data={values}
      xLabel={var1Name.split(".").pop()?.replace(/_/g, " ")}
      yLabel="Count"
      downloadFileName={`${var1Name}_histogram`}
      densityLine
      animationType="slideUp"
      color="#e67e22"
      densityLineColor="#e74c3c"
    />
  );
}
