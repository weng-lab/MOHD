import { Box, CircularProgress } from "@mui/material";
import { type PhenotypicalDataPoint } from "@/common/hooks/usePhenotypicalData";
import CategoricalBarPlot from "./CategoricalBarPlot";
import QuantitativeHistogram from "./QuantitativeHistogram";

type Props = {
  var1Name: string;
  var1Category: string | null;
  rawData: PhenotypicalDataPoint[];
  loading: boolean;
};

export default function PlotSelector({ var1Name, var1Category, rawData, loading }: Props) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!var1Category) return null;

  return var1Category === "Categorical" ? (
    <CategoricalBarPlot rawData={rawData} var1Name={var1Name} />
  ) : (
    <QuantitativeHistogram rawData={rawData} var1Name={var1Name} />
  );
}
