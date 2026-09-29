"use client";

import { Box, MenuItem, Select, Stack, Typography } from "@mui/material";
import { ScatterPlot, ScatterPlotSync, getSharedDomains, type Point } from "@weng-lab/visualization";
import { useRef, useState } from "react";
import { dimHidden, spotlight } from "@/common/components/plotDimming";
import { shapeOf } from "@/common/components/pointShapes";
import { PLOT_HEIGHT } from "./dimensions";
import {
  MOHD_COLOR_OPTIONS,
  REFERENCE_COLOR_OPTIONS,
  type ColorField,
  type ColorOption,
  type MohdColorField,
  type ReferenceColorField,
} from "./fields";
import { buildGroups, displayValue, groupValue, recount, shapeScaleFor, type GroupInfo } from "./groups";
import PlotCard, { type LegendHover, type LegendRow } from "./PlotCard";
import PlotTooltip from "@/common/components/PlotTooltip";
import { useSharedPlotSize } from "./useSharedPlotSize";
import { PC_COUNT, type MohdRow, type ReferenceRow } from "./types";

/** A point's groups on the fields coloring and shaping it. `shapeGroup` is null while nothing shapes the plot. */
type Meta<T> = { row: T; group: string; shapeGroup: string | null };

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

/** One cohort's encoding: the fields coloring and shaping its plot, and the values switched off in either legend. */
type CohortView<K extends ColorField> = {
  colorBy: K;
  shapeBy: K | null;
  /** By field, for the fields in a legend only - see encode. */
  hidden: Partial<Record<K, ReadonlySet<string>>>;
};

/** A new color or shape field. A field leaving the legends takes its filter with it: no chip would be left to show it. */
const encode = <K extends ColorField>(
  view: CohortView<K>,
  change: Partial<Pick<CohortView<K>, "colorBy" | "shapeBy">>
): CohortView<K> => {
  const next = { ...view, ...change };
  const hidden: CohortView<K>["hidden"] = {};
  for (const key of [next.colorBy, next.shapeBy]) if (key !== null && view.hidden[key]) hidden[key] = view.hidden[key];
  return { ...next, hidden };
};

const toggleHidden = <K extends ColorField>(view: CohortView<K>, key: K, value: string): CohortView<K> => {
  const next = new Set(view.hidden[key]);
  if (!next.delete(value)) next.add(value);
  return { ...view, hidden: { ...view.hidden, [key]: next } };
};

/**
 * One cohort's legends and points, colored by its group and shaped by its other field if any.
 *
 * "Unknown" is laid out first so it draws beneath the named groups. It is the darkest thing on
 * either plot now that it takes the neutral scale's dark end, and nothing about a sample having no
 * value should put it in front of the ones that do.
 */
const encodeCohort = <T extends { sample_id: string; pcs: number[] }, K extends keyof T & ColorField>(
  rows: T[],
  view: CohortView<K>,
  onChange: (view: CohortView<K>) => void,
  options: readonly ColorOption<K>[],
  xPc: number,
  yPc: number,
  /** Categories folded into the privacy bin - see buildGroups. */
  binMembers?: string[]
) => {
  const { colorBy, hidden } = view;
  const scale = view.shapeBy && shapeScaleFor(rows, view.shapeBy);
  const shapeBy = scale ? view.shapeBy : null;
  const labelOf = (key: K) => options.find((option) => option.key === key)?.label ?? key;

  const colorGroups = buildGroups(rows, colorBy, binMembers);
  const colors = new Map(colorGroups.map((g) => [g.value, g.color]));
  const points: Point<Meta<T>>[] = rows.map((row) => {
    const group = groupValue(row[colorBy]);
    const shapeGroup = shapeBy && groupValue(row[shapeBy]);
    return {
      x: row.pcs[xPc],
      y: row.pcs[yPc],
      r: 3,
      color: colors.get(group),
      shape: shapeBy ? shapeOf(scale, shapeGroup) : undefined,
      metaData: { row, group, shapeGroup },
    };
  });

  const passesColor = ({ metaData }: Point<Meta<T>>) => !hidden[colorBy]?.has(metaData!.group);
  const passesShape = ({ metaData }: Point<Meta<T>>) =>
    metaData!.shapeGroup === null || !(shapeBy && hidden[shapeBy]?.has(metaData!.shapeGroup));
  const rowsPassing = (passes: (point: Point<Meta<T>>) => boolean) =>
    points.filter(passes).map(({ metaData }) => metaData!.row);

  // Each legend counts the samples the other's filter leaves in, as the explorer's legends do.
  const legendRow = (key: K, groups: GroupInfo[], counted: T[]): LegendRow => ({
    label: labelOf(key),
    groups: recount(groups, counted, key),
    hidden: hidden[key] ?? new Set(),
    onToggle: (value) => onChange(toggleHidden(view, key, value)),
  });
  const color = legendRow(colorBy, colorGroups, !shapeBy || shapeBy === colorBy ? rows : rowsPassing(passesShape));
  const shape =
    shapeBy && scale
      ? { ...legendRow(shapeBy, buildGroups(rows, shapeBy, binMembers), rowsPassing(passesColor)), scale }
      : null;

  return {
    points: [
      ...points.filter(({ metaData }) => metaData!.group === "Unknown"),
      ...points.filter(({ metaData }) => metaData!.group !== "Unknown"),
    ],
    isShown: (point: Point<Meta<T>>) => passesColor(point) && passesShape(point),
    color,
    shape,
    shapeBy,
    canShape: (key: K) =>
      options.find((option) => option.key === key)?.shapeable !== false && shapeScaleFor(rows, key) !== null,
  };
};

/**
 * The points of a hovered chip's group, from those in focus, so hovering the chip of a group that is
 * toggled off highlights nothing - it is on the plot, but as background. Null with none to highlight.
 */
const hoveredGroup = <T,>(shown: Point<Meta<T>>[], hover: LegendHover | null) => {
  const group = hover
    ? shown.filter(
        ({ metaData }) => (hover.legend === "color" ? metaData!.group : metaData!.shapeGroup) === hover.value
      )
    : [];
  return group.length > 0 ? group : null;
};

/** A cohort's plot props for the chip under the cursor: its group highlighted, and the rest dimmed around it. */
const highlightFor = <T,>(all: Point<Meta<T>>[], shown: Point<Meta<T>>[], hover: LegendHover | null) => {
  const group = hoveredGroup(shown, hover);
  return { pointData: spotlight(all, group), hoveredPoints: group ?? undefined };
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
  <PlotTooltip
    title={String((row as { sample_id: string }).sample_id)}
    // Dimmed points can win the hit test, so a dimmed sample says it's hidden.
    note={dimmed ? "Hidden by the current filters" : undefined}
    rows={options.map(({ key, label }) => ({ label, value: displayValue(key, row[key]) }))}
  />
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
  const [refView, setRefView] = useState<CohortView<ReferenceColorField>>({
    colorBy: "superpop",
    shapeBy: null,
    hidden: {},
  });
  const [mohdView, setMohdView] = useState<CohortView<MohdColorField>>({
    colorBy: "reported_race_ethnicity",
    shapeBy: null,
    hidden: {},
  });
  // Note what this component deliberately does not hold: the hover. It lives in PlotCard, which
  // hands it back to the plot below - see that component for why the points must not be built
  // beside it.

  // One size drives both plots - see useSharedPlotSize for why they can't size
  // themselves here.
  const refPlotRef = useRef<HTMLDivElement>(null);
  const mohdPlotRef = useRef<HTMLDivElement>(null);
  const plotSize = useSharedPlotSize(refPlotRef, mohdPlotRef);

  const refCohort = encodeCohort(reference, refView, setRefView, REFERENCE_COLOR_OPTIONS, xPc, yPc);
  const mohdCohort = encodeCohort(mohd, mohdView, setMohdView, MOHD_COLOR_OPTIONS, xPc, yPc, binnedRaceEthnicity);

  // Domains come from every point, not just the ones in focus, so toggling a
  // group off doesn't rescale the axes underneath the remaining points.
  const domains = getSharedDomains(refCohort.points, mohdCohort.points);

  // A group switched off is faded into the background rather than taken off the plot: where a
  // sample falls in a PCA is a statement about the samples around it, and dropping points takes
  // away the very comparison the two cohorts are here to make.
  const { points: refAll, shown: refShown } = dimHidden(refCohort.points, refCohort.isShown);
  const { points: mohdAll, shown: mohdShown } = dimHidden(mohdCohort.points, mohdCohort.isShown);

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
              colorBy={mohdView.colorBy}
              onColorByChange={(colorBy) => setMohdView(encode(mohdView, { colorBy }))}
              shapeBy={mohdCohort.shapeBy}
              onShapeByChange={(shapeBy) => setMohdView(encode(mohdView, { shapeBy }))}
              canShape={mohdCohort.canShape}
              color={mohdCohort.color}
              shape={mohdCohort.shape}
              plotRef={mohdPlotRef}
            >
              {({ legendHover, onPlotHover }) => (
                <ScatterPlot
                  {...highlightFor(mohdAll, mohdShown, legendHover)}
                  loading={false}
                  bottomAxisLabel={xLabel}
                  leftAxisLabel={yLabel}
                  controlsPosition="right"
                  tooltipBody={(p) => (
                    <Tooltip row={p.metaData!.row} options={MOHD_COLOR_OPTIONS} dimmed={!mohdCohort.isShown(p)} />
                  )}
                  onHoveredPointChange={(p) => onPlotHover(p?.metaData ?? null)}
                  miniMap={MINIMAP_POSITION}
                  {...sync}
                />
              )}
            </PlotCard>

            <PlotCard
              title="1000G+HGDP"
              shown={refShown.length}
              total={refAll.length}
              options={REFERENCE_COLOR_OPTIONS}
              colorBy={refView.colorBy}
              onColorByChange={(colorBy) => setRefView(encode(refView, { colorBy }))}
              shapeBy={refCohort.shapeBy}
              onShapeByChange={(shapeBy) => setRefView(encode(refView, { shapeBy }))}
              canShape={refCohort.canShape}
              color={refCohort.color}
              shape={refCohort.shape}
              plotRef={refPlotRef}
            >
              {({ legendHover, onPlotHover }) => (
                <ScatterPlot
                  {...highlightFor(refAll, refShown, legendHover)}
                  loading={false}
                  bottomAxisLabel={xLabel}
                  leftAxisLabel={yLabel}
                  controlsPosition="right"
                  tooltipBody={(p) => (
                    <Tooltip row={p.metaData!.row} options={REFERENCE_COLOR_OPTIONS} dimmed={!refCohort.isShown(p)} />
                  )}
                  onHoveredPointChange={(p) => onPlotHover(p?.metaData ?? null)}
                  miniMap={MINIMAP_POSITION}
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
