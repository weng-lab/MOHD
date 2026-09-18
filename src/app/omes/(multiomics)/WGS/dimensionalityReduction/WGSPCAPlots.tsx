"use client";

import { Box, MenuItem, Select, Stack, Typography } from "@mui/material";
import { ScatterPlot, ScatterPlotSync, getSharedDomains, type Point } from "@weng-lab/visualization";
import { useRef, useState } from "react";
import { dimHidden } from "@/common/components/plotDimming";
import { PLOT_HEIGHT } from "./dimensions";
import {
  MOHD_COLOR_OPTIONS,
  REFERENCE_COLOR_OPTIONS,
  type ColorField,
  type ColorOption,
  type MohdColorField,
  type ReferenceColorField,
} from "./fields";
import { buildGroups, displayValue, groupValue, type GroupInfo } from "./groups";
import PlotCard from "./PlotCard";
import { useSharedPlotSize } from "./useSharedPlotSize";
import { PC_COUNT, type MohdRow, type ReferenceRow } from "./types";

type Meta<T> = { row: T; group: string };

const PC_CHOICES = Array.from({ length: PC_COUNT }, (_, i) => ({ value: i, label: `PC${i + 1}` }));

/**
 * Axis label for a PC: "PC1 (41.2%)", or a bare "PC1" where the API has no
 * variance for it.
 *
 * Rounded here rather than on the server because the decimal has to be a
 * *rendered* one - a PC that lands on 1.0% is the number 1 once rounded, and
 * would otherwise reach the axis as "1%" beside its neighbours' "41.2%".
 */
const axisLabel = (pc: number, pve: (number | null)[]) => {
  const value = pve[pc];
  return value === null || value === undefined ? `PC${pc + 1}` : `PC${pc + 1} (${value.toFixed(1)}%)`;
};

/**
 * Builds plot points for one cohort, coloring each by its group.
 *
 * "Unknown" is laid out first so it draws beneath the named groups. It is the darkest thing on
 * either plot now that it takes the neutral scale's dark end, and nothing about a sample having no
 * value should put it in front of the ones that do.
 */
const toPoints = <T extends { sample_id: string; pcs: number[] }>(
  rows: T[],
  key: keyof T & ColorField,
  groups: GroupInfo[],
  xPc: number,
  yPc: number
): Point<Meta<T>>[] => {
  const colors = new Map(groups.map((g) => [g.value, g.color]));
  const points = rows.map((row) => {
    const group = groupValue(row[key]);
    return {
      x: row.pcs[xPc],
      y: row.pcs[yPc],
      r: 3,
      color: colors.get(group),
      metaData: { row, group },
    };
  });
  return [
    ...points.filter(({ metaData }) => metaData.group === "Unknown"),
    ...points.filter(({ metaData }) => metaData.group !== "Unknown"),
  ];
};

const Tooltip = <T,>({
  row,
  options,
  dimmed,
}: {
  row: T;
  options: readonly ColorOption<keyof T & ColorField>[];
  dimmed: boolean;
}) => (
  <Box sx={{ p: 1 }}>
    <Typography variant="body2">
      <strong>{String((row as { sample_id: string }).sample_id)}</strong>
    </Typography>
    {/*
      A dimmed sample says so. The plot hit-tests in draw order, so a dimmed point within a few
      pixels of one in focus is the one the cursor finds, and without this line the reader is left
      wondering why the colored point they aimed at named a sample from a group they switched off.
    */}
    {dimmed && (
      <Typography variant="caption" display="block" color="text.secondary" fontStyle="italic">
        Hidden by the current filters
      </Typography>
    )}
    {options.map(({ key, label }) => (
      <Typography key={String(key)} variant="caption" display="block">
        {label}: {displayValue(key, row[key])}
      </Typography>
    ))}
  </Box>
);

/**
 * One shared axis. Renders its value inline ("X - PC1") rather than through a
 * floating label, which keeps the header row a single line tall.
 */
const AxisSelect = ({ axis, value, onChange }: { axis: "X" | "Y"; value: number; onChange: (pc: number) => void }) => (
  <Select
    size="small"
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    renderValue={(pc) => `${axis} · PC${Number(pc) + 1}`}
    inputProps={{ "aria-label": `${axis} axis` }}
    sx={{
      bgcolor: "background.paper",
      "& .MuiSelect-select": { py: 0.75, fontSize: 13 },
    }}
  >
    {PC_CHOICES.map((o) => (
      <MenuItem key={o.value} value={o.value}>
        {o.label}
      </MenuItem>
    ))}
  </Select>
);

export type WGSPCAPlotsProps = {
  reference: ReferenceRow[];
  mohd: MohdRow[];
  /** Percent of variance explained, zero-indexed to match a row's `pcs`. */
  pve: (number | null)[];
  /** Reported race/ethnicity categories the server folded into the privacy bin. */
  binnedRaceEthnicity: string[];
};

const MINIMAP_POSITION = { position: { right: 50, bottom: 50 } };

const WGSPCAPlots = ({ reference, mohd, pve, binnedRaceEthnicity }: WGSPCAPlotsProps) => {
  const [xPc, setXPc] = useState(0);
  const [yPc, setYPc] = useState(1);
  const [refKey, setRefKey] = useState<ReferenceColorField>("superpop");
  const [mohdKey, setMohdKey] = useState<MohdColorField>("reported_race_ethnicity");
  const [hiddenRef, setHiddenRef] = useState<ReadonlySet<string>>(new Set());
  const [hiddenMohd, setHiddenMohd] = useState<ReadonlySet<string>>(new Set());
  // Note what this component deliberately does not hold: the hover. It lives in PlotCard, which
  // hands it back to the plot below - see that component for why the points must not be built
  // beside it.

  // One size drives both plots - see useSharedPlotSize for why they can't size
  // themselves here.
  const refPlotRef = useRef<HTMLDivElement>(null);
  const mohdPlotRef = useRef<HTMLDivElement>(null);
  const plotSize = useSharedPlotSize(refPlotRef, mohdPlotRef);

  const refGroups = buildGroups(reference, refKey);
  const mohdGroups = buildGroups(mohd, mohdKey, binnedRaceEthnicity);

  const refPoints = toPoints(reference, refKey, refGroups, xPc, yPc);
  const mohdPoints = toPoints(mohd, mohdKey, mohdGroups, xPc, yPc);

  // Domains come from every point, not just the ones in focus, so toggling a
  // group off doesn't rescale the axes underneath the remaining points.
  const domains = getSharedDomains(refPoints, mohdPoints);

  // A group switched off is faded into the background rather than taken off the plot: where a
  // sample falls in a PCA is a statement about the samples around it, and dropping points takes
  // away the very comparison the two cohorts are here to make.
  const { points: refAll, shown: refShown } = dimHidden(refPoints, (p) => !hiddenRef.has(p.metaData!.group));
  const { points: mohdAll, shown: mohdShown } = dimHidden(mohdPoints, (p) => !hiddenMohd.has(p.metaData!.group));

  const toggle = (setHidden: (fn: (prev: ReadonlySet<string>) => ReadonlySet<string>) => void) => (value: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (!next.delete(value)) next.add(value);
      return next;
    });

  const xLabel = axisLabel(xPc, pve);
  const yLabel = axisLabel(yPc, pve);

  return (
    <Stack gap={2}>
      {/*
        Three columns so the axis cluster lands over the gutter between the two
        cards, equidistant from both: it drives them both, and nothing about its
        position should suggest otherwise. The empty third column is what centres
        it - there is no content for it to hold.
      */}
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr auto 1fr" }} alignItems="center" gap={1}>
        <Typography variant="h5">Ancestry PCA</Typography>
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{
            px: 1.5,
            py: 0.75,
            // Dashed, and outside either card's border: the one control group on
            // the page that deliberately belongs to neither cohort.
            border: 1,
            borderStyle: "dashed",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "surface.light",
            justifySelf: { sm: "center" },
          }}
        >
          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
            Shared axes
          </Typography>
          <AxisSelect axis="X" value={xPc} onChange={setXPc} />
          <AxisSelect axis="Y" value={yPc} onChange={setYPc} />
        </Stack>
      </Box>

      {/*
        The shared size goes here rather than on each plot. ScatterPlotSync forwards its own
        width and height to both children, so a {...sync} spread after {...plotSize} on a plot
        overwrites the shared size with undefined and sends each plot back to measuring its own
        container - which only diverges once the two legends wrap to different heights, and then
        the synced zoom drifts because its transform is in pixels.
      */}
      <ScatterPlotSync {...domains} {...plotSize}>
        {(sync) => (
          <Stack direction={{ xs: "column", lg: "row" }} gap={2} height={{ lg: PLOT_HEIGHT }}>
            <PlotCard
              title="MOHD"
              shown={mohdShown.length}
              total={mohdAll.length}
              options={MOHD_COLOR_OPTIONS}
              colorBy={mohdKey}
              onColorByChange={(key) => {
                setMohdKey(key);
                setHiddenMohd(new Set());
              }}
              groups={mohdGroups}
              hidden={hiddenMohd}
              onToggle={toggle(setHiddenMohd)}
              plotRef={mohdPlotRef}
            >
              {({ legendHover, onPlotHover }) => (
                <ScatterPlot
                  pointData={mohdAll}
                  loading={false}
                  bottomAxisLabel={xLabel}
                  leftAxisLabel={yLabel}
                  controlsPosition="right"
                  tooltipBody={(p) => (
                    <Tooltip
                      row={p.metaData!.row}
                      options={MOHD_COLOR_OPTIONS}
                      dimmed={hiddenMohd.has(p.metaData!.group)}
                    />
                  )}
                  // From the points in focus rather than all of them, so hovering the chip of a group
                  // that is toggled off highlights nothing - it is on the plot, but as background.
                  hoveredPoints={legendHover ? mohdShown.filter((p) => p.metaData!.group === legendHover) : undefined}
                  onHoveredPointChange={(p) => onPlotHover(p?.metaData?.group ?? null)}
                  miniMap={MINIMAP_POSITION}
                  groupPointsAnchor="group"
                  {...sync}
                />
              )}
            </PlotCard>

            <PlotCard
              title="1000G+HGDP"
              shown={refShown.length}
              total={refAll.length}
              options={REFERENCE_COLOR_OPTIONS}
              colorBy={refKey}
              onColorByChange={(key) => {
                setRefKey(key);
                setHiddenRef(new Set());
              }}
              groups={refGroups}
              hidden={hiddenRef}
              onToggle={toggle(setHiddenRef)}
              plotRef={refPlotRef}
            >
              {({ legendHover, onPlotHover }) => (
                <ScatterPlot
                  pointData={refAll}
                  loading={false}
                  bottomAxisLabel={xLabel}
                  leftAxisLabel={yLabel}
                  controlsPosition="right"
                  tooltipBody={(p) => (
                    <Tooltip
                      row={p.metaData!.row}
                      options={REFERENCE_COLOR_OPTIONS}
                      dimmed={hiddenRef.has(p.metaData!.group)}
                    />
                  )}
                  // From the points in focus rather than all of them, so hovering the chip of a group
                  // that is toggled off highlights nothing - it is on the plot, but as background.
                  hoveredPoints={legendHover ? refShown.filter((p) => p.metaData!.group === legendHover) : undefined}
                  onHoveredPointChange={(p) => onPlotHover(p?.metaData?.group ?? null)}
                  miniMap={MINIMAP_POSITION}
                  groupPointsAnchor="group"
                  {...sync}
                />
              )}
            </PlotCard>
          </Stack>
        )}
      </ScatterPlotSync>
    </Stack>
  );
};

export default WGSPCAPlots;
