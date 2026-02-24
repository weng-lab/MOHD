import React, { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Point } from "@weng-lab/visualization";
import { defaultStyles, useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { TooltipInPortalProps } from "@visx/tooltip/lib/hooks/useTooltipInPortal";
import { localPoint } from "@visx/event";
import { ATACMetadata } from "@/app/omes/(multiomics)/ATAC/dimensionalityReduction/page";
import { sex_color_map, status_color_map, site_color_map, protocol_color_map } from "@/common/colors";

type Data = {
  label: string;
  color: string;
};

type UMAPLegendProps<T extends ATACMetadata[number]> = {
  colorScheme: "sex" | "status" | "site" | "protocol";
  scatterData: Point<T>[];
};

export default function UMAPLegend<T extends ATACMetadata[number]>({
  colorScheme,
  scatterData,
}: UMAPLegendProps<T>) {
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  //Fix weird type error on build
  //Type error: 'TooltipInPortal' cannot be used as a JSX component.
  const TooltipComponent = TooltipInPortal as unknown as React.FC<TooltipInPortalProps>;

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip<Data>();

  const handleMouseOver = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const coords = localPoint(event, event);
    showTooltip({
      tooltipLeft: coords?.x ?? 0,
      tooltipTop: coords?.y ?? 0 - 200,
      tooltipData: { label: "", color: "" },
    });
  };

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
        label,
        value,
        color: getColor(label),
      }))
      .sort((a, b) => b.value - a.value);

  }, [scatterData, colorScheme]);


  const cols = 6;

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        mr={1}
        onMouseMove={(e) => handleMouseOver(e)}
        onMouseLeave={hideTooltip}
        ref={containerRef}
        sx={{
          cursor: "default",
          px: 1,
          py: 0.25,
          borderRadius: 1,
          bgcolor: "action.hover",
          "&:hover": {
            bgcolor: "action.selected",
          },
          transition: "background-color 0.2s ease",
        }}
      >
        <InfoOutlinedIcon fontSize="small" color="action" />
        <Typography color="text.secondary" fontWeight="bold">
          Legend:
        </Typography>
        {legendEntries.slice(0, 3).map((entry, i) => (
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
        {legendEntries.length > 3 && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              ...
            </Typography>
          </Stack>
        )}
      </Stack>
      {tooltipOpen && tooltipData && (
        <TooltipComponent top={tooltipTop} left={tooltipLeft} style={{ zIndex: 1000, ...defaultStyles }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: legendEntries?.length / cols >= 3 ? "space-between" : "flex-start",
              gap: legendEntries?.length / cols >= 4 ? 0 : 10,
              p: 1,
            }}
          >
            {Array.from({ length: Math.ceil(legendEntries?.length / cols) }, (_, colIndex) => (
              <Box key={colIndex} sx={{ mr: 2 }}>
                {legendEntries.slice(colIndex * cols, colIndex * cols + cols).map((cellType, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: cellType.color,
                        mr: 1,
                        borderRadius: "10px",
                      }}
                    />
                    <Typography variant="body2">
                      {cellType.label
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                      : {cellType.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </TooltipComponent>
      )}
    </>
  );
}
