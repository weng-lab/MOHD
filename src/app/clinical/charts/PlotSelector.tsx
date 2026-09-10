import { Box, CircularProgress, Typography } from "@mui/material";
import { type PhenotypicalDataPoint } from "@/common/hooks/usePhenotypicalData";
import CategoricalBarPlot from "./CategoricalBarPlot";
import QuantitativeHistogram from "./QuantitativeHistogram";

type Props = {
  var1Name: string;
  var2Name: string;
  var1Category: string | null;
  var2Category: string | null;
  rawData: PhenotypicalDataPoint[];
  loading: boolean;
};

type PlotKey = "cat-none" | "quant-none" | "cat-cat" | "quant-quant" | "cat-quant";

function getPlotKey(v1Cat: string, v2Cat: string | null): PlotKey {
  if (!v2Cat) return v1Cat === "Categorical" ? "cat-none" : "quant-none";
  if (v1Cat === "Categorical" && v2Cat === "Categorical") return "cat-cat";
  if (v1Cat === "Quantitative" && v2Cat === "Quantitative") return "quant-quant";
  return "cat-quant";
}

export default function PlotSelector({ var1Name, var2Name, var1Category, var2Category, rawData, loading }: Props) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!var1Category) return null;

  const effectiveVar2Cat = var2Name === "none" ? null : var2Category;
  const plotKey = getPlotKey(var1Category, effectiveVar2Cat);

  switch (plotKey) {
    case "cat-none":
      return <CategoricalBarPlot rawData={rawData} var1Name={var1Name} />;

    case "quant-none":
      return <QuantitativeHistogram rawData={rawData} var1Name={var1Name} />;

    case "cat-cat":
    case "quant-quant":
    case "cat-quant":
      return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", px: 4 }}>
          <Typography color="text.secondary" textAlign="center">
            Comparing two variables is temporarily unavailable while the phenotypical data API is missing a
            per-participant identifier.
          </Typography>
        </Box>
      );
  }
}
