"use client";
import { useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { usePhenotypicalVariables } from "@/common/hooks/usePhenotypicalVariables";
import { usePhenotypicalData } from "@/common/hooks/usePhenotypicalData";
import PlotSelector from "./charts/PlotSelector";
import TreeSelect from "./TreeSelect";
import { EXCLUDED_VARIABLE_NAMES, FORCE_QUANTITATIVE_VARIABLE_NAMES, plotHeading } from "./helpers";

/** The variable's category, defaulting to Categorical when the data omits one. */
function CategoryChip({ category }: { category?: string | null }) {
  return (
    <Chip
      label={category ?? "Categorical"}
      variant="outlined"
      size="small"
      sx={{ alignSelf: "flex-start", borderColor: "primary.main", color: "primary.main" }}
    />
  );
}

export default function DataExplorer() {
  const { data, loading: varsLoading } = usePhenotypicalVariables();
  const variables = (data ?? [])
    .filter((v) => !EXCLUDED_VARIABLE_NAMES.has(v.variable_name))
    .map((v) =>
      FORCE_QUANTITATIVE_VARIABLE_NAMES.has(v.variable_name) ? { ...v, variable_category: "Quantitative" } : v
    );

  const [var1Name, setVar1Name] = useState("");

  const effectiveVar1 = var1Name || variables[0]?.variable_name || "";

  const selectedVar = variables.find((v) => v.variable_name === effectiveVar1);

  const varNames = effectiveVar1 ? [effectiveVar1] : [];
  const { data: rawData, loading: dataLoading } = usePhenotypicalData(varNames, !effectiveVar1);

  return (
    <Box sx={{ px: { xs: 3, sm: 4, md: 8, lg: 10 }, py: 4, width: "100%", overflow: "hidden" }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Data Explorer
      </Typography>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "primary.light",
          backgroundColor: "surface.light",
          borderRadius: 1,
          p: 2.5,
          mb: 3,
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Typography sx={{ color: "text.secondary" }}>SELECT</Typography>
        <Stack spacing={1} mt={2} sx={{ maxWidth: { md: "50%" } }}>
          <TreeSelect
            variables={variables}
            value={effectiveVar1}
            onChange={setVar1Name}
            label="Variable"
            disabled={varsLoading}
          />
          <CategoryChip category={selectedVar?.variable_category} />
        </Stack>
      </Box>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "primary.light",
          backgroundColor: "surface.light",
          borderRadius: 1,
          p: 3,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Typography variant="subtitle1" fontWeight={500} textAlign="center" mb={2}>
          {plotHeading(effectiveVar1)}
        </Typography>
        <Box
          sx={{
            height: { xs: 320, sm: 420, md: 600 },
            overflow: "hidden",
            width: "100%",
            minWidth: 0,
            "& > div": { minWidth: "0 !important" },
          }}
        >
          <PlotSelector
            var1Name={effectiveVar1}
            var1Category={selectedVar?.variable_category ?? null}
            rawData={rawData ?? []}
            loading={dataLoading}
          />
        </Box>
      </Box>
    </Box>
  );
}
