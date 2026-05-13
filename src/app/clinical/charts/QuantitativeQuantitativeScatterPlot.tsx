"use client";
import { useMemo } from "react";
import { ScatterPlot, type Point } from "@weng-lab/visualization";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { type PhenotypicalDataPoint } from "@/common/hooks/usePhenotypicalData";

type Metadata = { x: number, y: number };

type Props = {
  rawData: PhenotypicalDataPoint[];
  var1Name: string;
  var2Name: string;
};

function formatLabel(name: string) {
  return name.split(".").pop()?.replace(/_/g, " ") ?? name;
}

export default function QuantitativeQuantitativeScatterPlot({ rawData, var1Name, var2Name }: Props) {
  const theme = useTheme();
  const pointColor = theme.palette.primary.light;
  const controlsColor = theme.palette.primary.main;

  const scatterData: Point<Metadata>[] = useMemo(() => {
    const var1Map = new Map<string, number>();
    const var2Map = new Map<string, number>();

    for (const p of rawData) {
      if (p.value_numeric == null) continue;
      if (p.variable_name === var1Name) var1Map.set(p.participant_id, p.value_numeric);
      if (p.variable_name === var2Name) var2Map.set(p.participant_id, p.value_numeric);
    }

    const points: Point<Metadata>[] = [];
    for (const [pid, x] of var1Map) {
      const y = var2Map.get(pid);
      if (y == null) continue;
      points.push({ x, y, r: 4, color: pointColor, metaData: { x: x, y: y } });
    }
    return points;
  }, [rawData, var1Name, var2Name, pointColor]);

  if (scatterData.length === 0) return null;

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <ScatterPlot
        pointData={scatterData}
        loading={false}
        bottomAxisLabel={formatLabel(var1Name)}
        leftAxisLabel={formatLabel(var2Name)}
        controlsHighlight={controlsColor}
        downloadFileName={`${var1Name}_${var2Name}_scatter`}
        animation="scale"
        animationGroupSize={5}
        disableZoom
      />
    </Box>
  );
}
