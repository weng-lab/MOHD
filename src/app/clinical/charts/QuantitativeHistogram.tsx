"use client";
import { Histogram } from "@weng-lab/visualization";
import { type PhenotypicalDataPoint } from "@/common/hooks/usePhenotypicalData";

type Props = {
  rawData: PhenotypicalDataPoint[];
  var1Name: string;
};

export default function QuantitativeHistogram({ rawData, var1Name }: Props) {
  const values = rawData.flatMap((p) =>
    p.variable_name === var1Name && p.value_numeric != null ? [p.value_numeric] : []
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
