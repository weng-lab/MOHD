"use client";
import { useState } from "react";
import {
  Box, Chip, CircularProgress, FormControl, InputLabel, ListSubheader,
  MenuItem, Select, SelectChangeEvent, Stack, Typography,
} from "@mui/material";
import { usePhenotypicalVariables } from "@/common/hooks/usePhenotypicalVariables";

const VARIABLE2_OPTIONS = [
  { id: "none", label: "-none-" },
  { id: "sex", label: "Sex" },
  { id: "age_group", label: "Age group" },
  { id: "site", label: "Collection site" },
  { id: "protocol", label: "Protocol" },
];

function formatVariableName(name: string): string {
  return name
    .split(".")
    .map((seg) =>
      seg.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    )
    .join(" › ");
}

export default function DataExplorer() {
  const { data: variables, loading } = usePhenotypicalVariables();

  const firstVar = variables?.[0]?.variable_name ?? "";
  const [var1Name, setVar1Name] = useState("");
  const [var2Id, setVar2Id] = useState("none");

  const effectiveVar1 = var1Name || firstVar;
  const selectedVar = variables?.find((v) => v.variable_name === effectiveVar1);

  return (
    <Box sx={{ px: { xs: 3, sm: 4, md: 8, lg: 10 }, py: 6 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        [Data explorer]
      </Typography>

      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: 2.5,
          position: "relative",
          mb: 3,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            top: -10,
            left: 12,
            bgcolor: "background.paper",
            px: 0.5,
            color: "text.secondary",
            fontWeight: 700,
            letterSpacing: 1.2,
          }}
        >
          SELECT
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FormControl sx={{ flex: 1 }} size="small" disabled={loading}>
            <InputLabel>Variable 1</InputLabel>
            <Select
              label="Variable 1"
              value={effectiveVar1}
              onChange={(e: SelectChangeEvent) => setVar1Name(e.target.value)}
              MenuProps={{ disableScrollLock: true }}
              endAdornment={loading ? <CircularProgress size={16} sx={{ mr: 2 }} /> : null}
            >
              {["Categorical", "Quantitative"].flatMap((category) => {
                const group = (variables ?? []).filter(
                  (v) => v.variable_category === category
                );
                if (group.length === 0) return [];
                return [
                  <ListSubheader key={category} sx={{fontSize: 18, color: "black", fontWeight: 600}}>{category}</ListSubheader>,
                  ...group.map((v) => (
                    <MenuItem key={v.variable_name} value={v.variable_name}>
                      {formatVariableName(v.variable_name)}
                    </MenuItem>
                  )),
                ];
              })}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: 1 }} size="small">
            <InputLabel>Variable 2 (optional)</InputLabel>
            <Select
              label="Variable 2 (optional)"
              value={var2Id}
              onChange={(e: SelectChangeEvent) => setVar2Id(e.target.value)}
              MenuProps={{ disableScrollLock: true }}
            >
              {VARIABLE2_OPTIONS.map((opt) => (
                <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={1} mt={2}>
          <Chip
            label={selectedVar?.variable_category ?? "Categorical"}
            variant="outlined"
            size="small"
          />
        </Stack>
      </Box>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="subtitle1" fontWeight={500} textAlign="center" mb={2}>
          [{effectiveVar1 ? formatVariableName(effectiveVar1) : "Select a variable"}]
        </Typography>
      </Box>
    </Box>
  );
}
