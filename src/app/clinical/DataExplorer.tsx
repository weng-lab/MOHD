"use client";
import { useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { usePhenotypicalVariables } from "@/common/hooks/usePhenotypicalVariables";
import { usePhenotypicalData } from "@/common/hooks/usePhenotypicalData";
import PlotSelector from "./charts/PlotSelector";
import TreeSelect from "./TreeSelect";
import { plotHeading } from "./helpers";

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
  const variables = data ?? [];

  const [var1Name, setVar1Name] = useState("");
  const [var2Id, setVar2Id] = useState("none");

  const hasVar2 = var2Id !== "none";
  const effectiveVar1 = var1Name || variables[0]?.variable_name || "";

  const selectedVar = variables.find((v) => v.variable_name === effectiveVar1);
  const selectedVar2 = hasVar2 ? variables.find((v) => v.variable_name === var2Id) : null;

  const varNames = [effectiveVar1, hasVar2 ? var2Id : null].filter(Boolean) as string[];
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
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mt={2}>
          <Stack sx={{ flex: 1 }} spacing={1}>
            <TreeSelect
              variables={variables}
              value={effectiveVar1}
              onChange={setVar1Name}
              label="Variable 1"
              disabledValue={hasVar2 ? var2Id : undefined}
              disabled={varsLoading}
            />
            <CategoryChip category={selectedVar?.variable_category} />
          </Stack>
          <Stack sx={{ flex: 1 }} spacing={1}>
            <TreeSelect
              variables={variables}
              value={var2Id}
              onChange={setVar2Id}
              label="Variable 2 (optional)"
              disabledValue={effectiveVar1}
              disabled={varsLoading}
              allowNone
            />
            {selectedVar2 && <CategoryChip category={selectedVar2.variable_category} />}
          </Stack>
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
          {plotHeading(effectiveVar1, var2Id)}
        </Typography>
        <Box
          sx={{
            height: 600,
            overflow: "hidden",
            width: "100%",
            minWidth: 0,
            "& > div": { minWidth: "0 !important" },
          }}
        >
          <PlotSelector
            var1Name={effectiveVar1}
            var2Name={var2Id}
            var1Category={selectedVar?.variable_category ?? null}
            var2Category={selectedVar2?.variable_category ?? null}
            rawData={rawData ?? []}
            loading={dataLoading}
          />
        </Box>
      </Box>
    </Box>
  );
}
