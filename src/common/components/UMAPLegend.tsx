import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Point } from "@weng-lab/visualization";
import { ATACMetadata } from "@/app/omes/(multiomics)/ATAC/dimensionalityReduction/page";
import { sex_color_map, status_color_map, site_color_map, protocol_color_map } from "@/common/colors";
import { RNAMetadata } from "@/app/omes/(multiomics)/RNA/dimensionalityReduction/page";

type ColorScheme = "sex" | "status" | "site" | "protocol";

type UMAPLegendProps<T extends ATACMetadata[number] | RNAMetadata[number]> = {
  colorScheme: ColorScheme;
  scatterData: Point<T>[];
};

type LegendEntry = {
  /** The raw metadata value, kept as the list key — `label` is display-only. */
  id: string;
  label: string;
  value: number;
  color: string | undefined;
};

function schemeValue(
  meta: ATACMetadata[number] | RNAMetadata[number],
  colorScheme: ColorScheme
): string {
  switch (colorScheme) {
    case "sex":
      return meta.sex;
    case "status":
      return meta.status;
    case "site":
      return meta.site;
    case "protocol":
      return "protocol" in meta ? meta.protocol : meta.kit;
    default:
      return "missing";
  }
}

function schemeColor(label: string, colorScheme: ColorScheme) {
  switch (colorScheme) {
    case "sex":
      return sex_color_map[label as keyof typeof sex_color_map];
    case "status":
      return status_color_map[label as keyof typeof status_color_map];
    case "site":
      return site_color_map[label as keyof typeof site_color_map];
    case "protocol":
      return protocol_color_map[label as keyof typeof protocol_color_map];
  }
}

/** Counts of each value under the active scheme, most common first. */
function buildLegendEntries<T extends ATACMetadata[number] | RNAMetadata[number]>(
  scatterData: Point<T>[],
  colorScheme: ColorScheme
): LegendEntry[] {
  if (!scatterData.length) return [];

  const counts = new Map<string, number>();
  for (const point of scatterData) {
    const meta = point.metaData;
    if (!meta) continue;
    const key = schemeValue(meta, colorScheme);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({
      id: label,
      label: label.replaceAll(" method", ""),
      value,
      color: schemeColor(label, colorScheme),
    }))
    .sort((a, b) => b.value - a.value);
}

export default function UMAPLegend<T extends ATACMetadata[number] | RNAMetadata[number]>({
  colorScheme,
  scatterData,
}: UMAPLegendProps<T>) {
  const legendEntries = buildLegendEntries(scatterData, colorScheme);

  return (
      <Stack
        direction={"row"}
        spacing={1}
        alignItems="center"
        mr={1}
        sx={{
          cursor: "default",
          px: 1,
          py: 0.25,
          borderRadius: 1,
          bgcolor: "action.hover",
        }}
      >
        <InfoOutlinedIcon fontSize="small" color="action" />
        <Typography color="text.secondary" fontWeight="bold">
          Legend:
        </Typography>
        {legendEntries.map((entry) => (
          <Box
            key={entry.id}
            sx={{
              display: "flex",
              alignItems: "center",
              mr: 1,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: entry.color,
                borderRadius: "50%",
                mr: 0.5,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {entry.label}
            </Typography>
          </Box>
        ))}
      </Stack>
  );
}
