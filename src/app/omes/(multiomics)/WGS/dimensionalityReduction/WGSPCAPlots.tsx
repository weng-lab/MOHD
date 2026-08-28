"use client";

import { Box, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { ScatterPlot, ScatterPlotSync, getSharedDomains, type Point } from "@weng-lab/visualization";
import { useMemo, useState } from "react";
import { buildGroups, groupValue, type GroupInfo } from "./colors";
import PlotLegend from "./PlotLegend";
import {
  MOHD_COLOR_OPTIONS,
  PC_COUNT,
  REFERENCE_COLOR_OPTIONS,
  type ColorOption,
  type MohdRow,
  type ReferenceRow,
} from "./types";

type Meta<T> = { row: T; group: string };

const PC_CHOICES = Array.from({ length: PC_COUNT }, (_, i) => ({ value: i, label: `PC${i + 1}` }));

/** Builds plot points for one cohort, colouring each by its group. */
const toPoints = <T extends { sample_id: string; pcs: number[] }>(
  rows: T[],
  key: keyof T,
  groups: GroupInfo[],
  xPc: number,
  yPc: number,
): Point<Meta<T>>[] => {
  const colors = new Map(groups.map((g) => [g.value, g.color]));
  return rows.map((row) => {
    const group = groupValue(row[key]);
    return {
      x: row.pcs[xPc],
      y: row.pcs[yPc],
      r: 3,
      color: colors.get(group),
      metaData: { row, group },
    };
  });
};

const Tooltip = <T,>({ row, options }: { row: T; options: ColorOption<T>[] }) => (
  <Box sx={{ p: 1 }}>
    <Typography variant="body2">
      <strong>{String((row as { sample_id: string }).sample_id)}</strong>
    </Typography>
    {options.map(({ key, label }) => (
      <Typography key={String(key)} variant="caption" display="block">
        {label}: {groupValue(row[key])}
      </Typography>
    ))}
  </Box>
);

export type WGSPCAPlotsProps = {
  reference: ReferenceRow[];
  mohd: MohdRow[];
};

const MINIMAP_POSITION = { position: { right: 50, bottom: 50 } };

const WGSPCAPlots = ({ reference, mohd }: WGSPCAPlotsProps) => {
  const [xPc, setXPc] = useState(0);
  const [yPc, setYPc] = useState(1);
  const [refKey, setRefKey] = useState<keyof ReferenceRow>("superpop");
  const [mohdKey, setMohdKey] = useState<keyof MohdRow>("case_status");
  const [hiddenRef, setHiddenRef] = useState<ReadonlySet<string>>(new Set());
  const [hiddenMohd, setHiddenMohd] = useState<ReadonlySet<string>>(new Set());

  const refGroups = useMemo(() => buildGroups(reference, refKey), [reference, refKey]);
  const mohdGroups = useMemo(() => buildGroups(mohd, mohdKey), [mohd, mohdKey]);

  const refPoints = useMemo(
    () => toPoints(reference, refKey, refGroups, xPc, yPc),
    [reference, refKey, refGroups, xPc, yPc],
  );
  const mohdPoints = useMemo(
    () => toPoints(mohd, mohdKey, mohdGroups, xPc, yPc),
    [mohd, mohdKey, mohdGroups, xPc, yPc],
  );

  // Domains come from every point, not just the visible ones, so toggling a
  // group off doesn't rescale the axes underneath the remaining points.
  const domains = useMemo(() => getSharedDomains(refPoints, mohdPoints), [refPoints, mohdPoints]);

  const visibleRef = useMemo(
    () => refPoints.filter((p) => !hiddenRef.has(p.metaData!.group)),
    [refPoints, hiddenRef],
  );
  const visibleMohd = useMemo(
    () => mohdPoints.filter((p) => !hiddenMohd.has(p.metaData!.group)),
    [mohdPoints, hiddenMohd],
  );

  const toggle = (setHidden: (fn: (prev: ReadonlySet<string>) => ReadonlySet<string>) => void) =>
    (value: string) =>
      setHidden((prev) => {
        const next = new Set(prev);
        if (!next.delete(value)) next.add(value);
        return next;
      });

  const xLabel = `PC${xPc + 1}`;
  const yLabel = `PC${yPc + 1}`;

  return (
    <Stack gap={2} height="100%">
      <Stack direction={{ xs: "column", sm: "row" }} gap={2} flexWrap="wrap">
        <TextField
          select size="small" label="X" value={xPc} sx={{ minWidth: 110 }}
          onChange={(e) => setXPc(Number(e.target.value))}
        >
          {PC_CHOICES.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        <TextField
          select size="small" label="Y" value={yPc} sx={{ minWidth: 110 }}
          onChange={(e) => setYPc(Number(e.target.value))}
        >
          {PC_CHOICES.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        <TextField
          select size="small" label="1000G+HGDP color by" value={refKey} sx={{ minWidth: 210 }}
          onChange={(e) => {
            setRefKey(e.target.value as keyof ReferenceRow);
            setHiddenRef(new Set());
          }}
        >
          {REFERENCE_COLOR_OPTIONS.map((o) => (
            <MenuItem key={String(o.key)} value={String(o.key)}>{o.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select size="small" label="MOHD color by" value={mohdKey} sx={{ minWidth: 210 }}
          onChange={(e) => {
            setMohdKey(e.target.value as keyof MohdRow);
            setHiddenMohd(new Set());
          }}
        >
          {MOHD_COLOR_OPTIONS.map((o) => (
            <MenuItem key={String(o.key)} value={String(o.key)}>{o.label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <ScatterPlotSync {...domains}>
        {(sync) => (
          <Stack direction={{ xs: "column", lg: "row" }} gap={2} height="max(60vh, 520px)">
            <Stack flex={1} minWidth={0} gap={1}>
              <Typography variant="subtitle2">1000G+HGDP ({reference.length})</Typography>
              <PlotLegend groups={refGroups} hidden={hiddenRef as Set<string>} onToggle={toggle(setHiddenRef)} />
              <Box flex={1} minHeight={0}>
                <ScatterPlot
                  pointData={visibleRef}
                  loading={false}
                  bottomAxisLabel={xLabel}
                  leftAxisLabel={yLabel}
                  tooltipBody={(p) => <Tooltip row={p.metaData!.row} options={REFERENCE_COLOR_OPTIONS} />}
                  miniMap={MINIMAP_POSITION}
                  {...sync}
                />
              </Box>
            </Stack>
            <Stack flex={1} minWidth={0} gap={1}>
              <Typography variant="subtitle2">MOHD ({mohd.length})</Typography>
              <PlotLegend groups={mohdGroups} hidden={hiddenMohd as Set<string>} onToggle={toggle(setHiddenMohd)} />
              <Box flex={1} minHeight={0}>
                <ScatterPlot
                  pointData={visibleMohd}
                  loading={false}
                  bottomAxisLabel={xLabel}
                  leftAxisLabel={yLabel}
                  controlsPosition="right"
                  tooltipBody={(p) => <Tooltip row={p.metaData!.row} options={MOHD_COLOR_OPTIONS} />}
                  miniMap={MINIMAP_POSITION}
                  {...sync}
                />
              </Box>
            </Stack>
          </Stack>
        )}
      </ScatterPlotSync>
    </Stack>
  );
};

export default WGSPCAPlots;
