import React, { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Point } from "@weng-lab/visualization";
import { ATACMetadata } from "@/app/omes/(multiomics)/ATAC/dimensionalityReduction/page";
import { sex_color_map, status_color_map, site_color_map, protocol_color_map } from "@/common/colors";
type UMAPLegendProps<T extends ATACMetadata[number]> = {
  colorScheme: "sex" | "status" | "site" | "protocol";
  scatterData: Point<T>[];
};

export default function UMAPLegend<T extends ATACMetadata[number]>({
  colorScheme,
  scatterData,
}: UMAPLegendProps<T>) {

  const legendEntries = useMemo(() => {
    if (!scatterData.length) return [];

    const counts = new Map<string, number>();

    scatterData.forEach((point) => {
      const meta = point.metaData;
      if (!meta) return;

      let key: string;

      switch (colorScheme) {
        case "sex":
          key = meta.sex;
          break;
        case "status":
          key = meta.status;
          break;
        case "site":
          key = meta.site;
          break;
        case "protocol":
          key = meta.protocol;
          break;
        default:
          key = "missing";
      }

      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const getColor = (label: string) => {
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
    };

    return Array.from(counts.entries())
      .map(([label, value]) => ({
        label: label.replaceAll(" method", ""),
        value,
        color: getColor(label),
      }))
      .sort((a, b) => b.value - a.value);

  }, [scatterData, colorScheme]);

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
        {legendEntries.map((entry, i) => (
          <Box
            key={i}
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
