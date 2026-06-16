"use client";
import { useMemo } from "react";
import { Histogram } from "@weng-lab/visualization";
import { type PhenotypicalDataPoint } from "@/common/hooks/usePhenotypicalData";

type Props = {
  rawData: PhenotypicalDataPoint[];
  var1Name: string;
};

export default function QuantitativeHistogram({ rawData, var1Name }: Props) {
  const values = useMemo(
    () =>
      rawData
        .filter((p) => p.variable_name === var1Name && p.value_numeric != null)
        .map((p) => p.value_numeric as number),
    [rawData, var1Name]
  );

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
