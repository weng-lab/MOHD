"use client";
import { useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { usePhenotypicalVariables } from "@/common/hooks/usePhenotypicalVariables";
import { usePhenotypicalData } from "@/common/hooks/usePhenotypicalData";
import PlotSelector from "./charts/PlotSelector";
import TreeSelect from "./TreeSelect";
import { formatVariableName } from "./helpers";

export default function DataExplorer() {
  const { data: variables, loading: varsLoading } = usePhenotypicalVariables();

  const [var1Name, setVar1Name] = useState("");
  const [var2Id, setVar2Id] = useState("none");

  const effectiveVar1 = var1Name || variables?.[0]?.variable_name || "";

  const selectedVar = variables?.find((v) => v.variable_name === effectiveVar1);
  const selectedVar2 = var2Id !== "none" ? variables?.find((v) => v.variable_name === var2Id) : null;

  const varNames = [effectiveVar1, var2Id !== "none" ? var2Id : null].filter(Boolean) as string[];
  const { data: rawData, loading: dataLoading } = usePhenotypicalData(varNames, !effectiveVar1);

  return (
    <Box sx={{ px: { xs: 3, sm: 4, md: 8, lg: 10 }, py: 4, width: "100%", overflow: "hidden" }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        [Data explorer]
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
              variables={variables ?? []}
              value={effectiveVar1}
              onChange={setVar1Name}
              label="Variable 1"
              disabledValue={var2Id !== "none" ? var2Id : undefined}
              disabled={varsLoading}
            />
            <Chip
              label={selectedVar?.variable_category ?? "Categorical"}
              variant="outlined"
              size="small"
              sx={{ alignSelf: "flex-start", borderColor: "primary.main", color: "primary.main" }}
            />
          </Stack>
          <Stack sx={{ flex: 1 }} spacing={1}>
            <TreeSelect
              variables={variables ?? []}
              value={var2Id}
              onChange={setVar2Id}
              label="Variable 2 (optional)"
              disabledValue={effectiveVar1}
              disabled={varsLoading}
              allowNone
            />
            {selectedVar2 && (
              <Chip
                label={selectedVar2.variable_category ?? "Categorical"}
                variant="outlined"
                size="small"
                sx={{ alignSelf: "flex-start", borderColor: "primary.main", color: "primary.main" }}
              />
            )}
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
          {effectiveVar1 && var2Id !== "none"
            ? `[${formatVariableName(effectiveVar1)} vs ${formatVariableName(var2Id)}]`
            : effectiveVar1
            ? `[${formatVariableName(effectiveVar1)}]`
            : "Select a variable"}
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
