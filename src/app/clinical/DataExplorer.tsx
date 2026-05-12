"use client";
import { useMemo, useState } from "react";
import {
  Box, Chip, CircularProgress, FormControl, InputLabel, ListSubheader,
  MenuItem, Select, SelectChangeEvent, Stack, Typography,
} from "@mui/material";
import { BarPlot, type BarData } from "@weng-lab/visualization";
import { usePhenotypicalVariables } from "@/common/hooks/usePhenotypicalVariables";
import { usePhenotypicalData } from "@/common/hooks/usePhenotypicalData";

const COLORS = ["#d502f9", "#2196f4", "#25a69a", "#7b1fa3", "#e67e22", "#e74c3c"];

function formatVariableName(name: string): string {
  return name
    .split(".")
    .map((seg) =>
      seg.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    )
    .join(" › ");
}

function groupedItems(
  variables: { variable_name: string; variable_category?: string | null }[],
  disabledName?: string
) {
  return ["Categorical", "Quantitative"].flatMap((category) => {
    const group = variables.filter((v) => v.variable_category === category);
    if (group.length === 0) return [];
    return [
      <ListSubheader key={category} sx={{ fontSize: 18, color: "black", fontWeight: 600 }}>
        {category}
      </ListSubheader>,
      ...group.map((v) => (
        <MenuItem
          key={v.variable_name}
          value={v.variable_name}
          disabled={v.variable_name === disabledName}
        >
          {formatVariableName(v.variable_name)}
        </MenuItem>
      )),
    ];
  });
}

export default function DataExplorer() {
  const { data: variables, loading: varsLoading } = usePhenotypicalVariables();

  const [var1Name, setVar1Name] = useState("");
  const [var2Id, setVar2Id] = useState("none");

  const effectiveVar1 = var1Name || variables?.[0]?.variable_name || "";

  const selectedVar = variables?.find((v) => v.variable_name === effectiveVar1);
  const selectedVar2 = var2Id !== "none" ? variables?.find((v) => v.variable_name === var2Id) : null;
  const isCategorical = selectedVar?.variable_category === "Categorical";

  const { data: rawData, loading: dataLoading } = usePhenotypicalData(
    [effectiveVar1],
    !effectiveVar1
  );

  const barData: BarData<{ count: number }>[] = useMemo(() => {
    if (!rawData) return [];
    const counts = new Map<string, number>();
    for (const p of rawData) {
      const key = p.assigned_category ?? p.value_text ?? "Unknown";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([label, count], i) => ({
        id: i.toString(),
        value: count,
        label: count.toString(),
        category: label.replace("_", " "),
        color: COLORS[i % COLORS.length],
        metadata: { count },
      }));
  }, [rawData]);

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
          position: "relative",
          mb: 3,
        }}
      >
        <Typography sx={{ color: "text.secondary" }}>SELECT</Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mt={2}>
          <Stack sx={{ flex: 1 }} spacing={1}>
            <FormControl size="small" disabled={varsLoading}>
              <InputLabel>Variable 1</InputLabel>
              <Select
                label="Variable 1"
                value={effectiveVar1}
                onChange={(e: SelectChangeEvent) => setVar1Name(e.target.value)}
                MenuProps={{ disableScrollLock: true }}
                endAdornment={varsLoading ? <CircularProgress size={16} sx={{ mr: 2 }} /> : null}
                renderValue={(v) => (v ? formatVariableName(v) : "")}
              >
                {groupedItems(variables ?? [])}
              </Select>
            </FormControl>
            <Chip
              label={selectedVar?.variable_category ?? "Categorical"}
              variant="outlined"
              size="small"
              sx={{ alignSelf: "flex-start", borderColor: "primary.main", color: "primary.main" }}
            />
          </Stack>

          <Stack sx={{ flex: 1 }} spacing={1}>
            <FormControl size="small" disabled={varsLoading}>
              <InputLabel>Variable 2 (optional)</InputLabel>
              <Select
                label="Variable 2 (optional)"
                value={var2Id}
                onChange={(e: SelectChangeEvent) => setVar2Id(e.target.value)}
                MenuProps={{ disableScrollLock: true }}
                renderValue={(v) => (v === "none" ? "-none-" : v ? formatVariableName(v) : "")}
              >
                <MenuItem value="none">-none-</MenuItem>
                {groupedItems(variables ?? [], effectiveVar1)}
              </Select>
            </FormControl>
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
        }}
      >
        <Typography variant="subtitle1" fontWeight={500} textAlign="center" mb={2}>
          [{effectiveVar1 ? formatVariableName(effectiveVar1) : "Select a variable"}]
        </Typography>

        <Box sx={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {dataLoading ? (
            <CircularProgress />
          ) : isCategorical && barData.length > 0 ? (
            <Box sx={{ width: "100%", height: "100%" }}>
              <BarPlot
                data={barData}
                topAxisLabel="Count"
                downloadFileName={`${var1Name}_distribution`}
                animation="slideRight"
                animationBuffer={0.01}
                barSpacing={5}
                barSize={40}
              />
            </Box>
          ) : !isCategorical && var1Name ? (
            <Typography color="text.secondary">
              Quantitative visualization coming soon
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
