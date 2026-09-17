import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Point } from "@weng-lab/visualization";
import { getCategoricalLabel, getCategoricalColor } from "@/common/colors";
import { age_bin_color_map, AGE_BIN_LABELS, AGE_BIN_RAMP, AGE_UNKNOWN_LABEL } from "@/common/ageBins";
import { DimensionalityReductionMeta } from "@/common/components/DimensionalityScatterPlot";
type UMAPLegendProps<T extends DimensionalityReductionMeta> = {
  colorScheme: "sex" | "status" | "site" | "protocol" | "age";
  scatterData: Point<T>[];
};

const legendContainerSx = {
  cursor: "default",
  px: 1,
  py: 0.25,
  borderRadius: 1,
  bgcolor: "action.hover",
  flexWrap: "wrap" as const,
  rowGap: 0.5,
};

export default function UMAPLegend<T extends DimensionalityReductionMeta>({
  colorScheme,
  scatterData,
}: UMAPLegendProps<T>) {
  if (colorScheme === "age") {
    const hasUnknown = scatterData.some((point) => {
      const meta = point.metaData;
      if (!meta) return false;
      return !meta.age_bin || meta.age_bin === AGE_UNKNOWN_LABEL;
    });

    return (
      <Stack direction="row" spacing={1} alignItems="center" mr={1} sx={legendContainerSx}>
        <InfoOutlinedIcon fontSize="small" color="action" />
        <Typography color="text.secondary" fontWeight="bold">
          Legend:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {AGE_BIN_LABELS[0]}
        </Typography>
        <Box
          sx={{
            width: 90,
            height: 10,
            borderRadius: 5,
            background: `linear-gradient(to right, ${AGE_BIN_RAMP.join(", ")})`,
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {AGE_BIN_LABELS[AGE_BIN_LABELS.length - 1]}
        </Typography>
        {hasUnknown && (
          <Stack direction="row" alignItems="center" spacing={0.5} ml={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: age_bin_color_map[AGE_UNKNOWN_LABEL],
                borderRadius: "50%",
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Unknown
            </Typography>
          </Stack>
        )}
      </Stack>
    );
  }

  const counts = new Map<string, number>();

  scatterData.forEach((point) => {
    const meta = point.metaData;
    if (!meta) return;

    let key: string;

    switch (colorScheme) {
      case "sex":
        key = getCategoricalLabel("sex", meta.sex);
        break;
      case "status":
        key = getCategoricalLabel("status", meta.status);
        break;
      case "site":
        key = getCategoricalLabel("site", meta.site);
        break;
      case "protocol":
        key = getCategoricalLabel("protocol", meta.protocol);
        break;
    }

    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const legendEntries = Array.from(counts.entries())
    .map(([label, value]) => ({
      label: label.replaceAll(" method", ""),
      value,
      color: getCategoricalColor(colorScheme, label),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Stack direction={"row"} spacing={1} alignItems="center" mr={1} sx={legendContainerSx}>
      <InfoOutlinedIcon fontSize="small" color="action" />
      <Typography color="text.secondary" fontWeight="bold">
        Legend:
      </Typography>
      {legendEntries.map((entry) => (
        <Box
          key={entry.label}
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
