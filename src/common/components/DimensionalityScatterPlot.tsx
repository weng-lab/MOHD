"use client";

import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ScatterPlot, type DownloadPlotHandle, type Point } from "@weng-lab/visualization";
import { useState, type ReactNode, type Ref } from "react";
import {
  colorOf,
  groupOf,
  isNeutralGroup,
  labelOf,
  type Field,
  type FieldDefinition,
  type SampleGroups,
  type SampleRow,
} from "@/common/sampleFields/fields";
import { passesFilters } from "@/common/sampleFields/groups";
import { NO_SHAPE, shapeOptions, shapeScale, type ShapeBy } from "@/common/sampleFields/shapes";
import FieldLegends, { type GroupHover } from "@/common/sampleFields/FieldLegends";
import type { SampleTableState } from "@/common/sampleFields/useSampleTable";
import { dimHidden } from "./plotDimming";
import { shapeOf } from "./pointShapes";
import PlotTooltip from "./PlotTooltip";

type Sample<T> = T & SampleGroups;

type PointMeta<T> = {
  sample: Sample<T>;
  /** Why the point is faded, if it is: the table's filters, or a selection it isn't part of. */
  faded: "filtered" | "unselected" | null;
};

const FADED_NOTES = {
  filtered: "Hidden by the current filters",
  unselected: "Not in the current selection",
};

const MINIMAP = { position: { right: 50, bottom: 50 } };

const SELECT_SLOT_PROPS = { select: { MenuProps: { disableScrollLock: true } } };

const SELECT_SX = { minWidth: 130, alignSelf: "flex-start" };

/** "Sex", "Sex and search", "Sex, Dataset and search". */
const listOf = (names: readonly string[]) =>
  names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

export type DimensionalityScatterPlotProps<T extends SampleRow> = {
  /** The page's table: the samples, and the selection and filters the plot shares with it. */
  table: SampleTableState<T>;
  loading: boolean;
  getX: (row: T) => number | null | undefined;
  getY: (row: T) => number | null | undefined;
  leftAxisLabel: string;
  bottomAxisLabel: string;
  downloadFileName: string;
  axisSelectors?: ReactNode;
  ref?: Ref<DownloadPlotHandle>;
};

/**
 * An ome's PCA or UMAP beside its table, colored and shaped by the explorer's fields with the same
 * chip legends. The table's filters decide what's faded, and the chips edit them; a selection from
 * the table or the plot fades the rest.
 */
const DimensionalityScatterPlot = <T extends SampleRow>({
  table,
  loading,
  getX,
  getY,
  leftAxisLabel,
  bottomAxisLabel,
  downloadFileName,
  axisSelectors,
  ref,
}: DimensionalityScatterPlotProps<T>) => {
  const [color, setColor] = useState<Field>("site");
  const [shape, setShape] = useState<ShapeBy>(NO_SHAPE);

  const { samples, fields, filters, selected, setSelected } = table;

  const shapeable = shapeOptions(fields, samples);
  const shapedField = shape === NO_SHAPE ? null : (shapeable.find(({ key }) => key === shape) ?? null);
  const shapes = shapedField && shapeScale(samples, shapedField.key);

  // Filters no legend row shows, named so the reader knows why points are faded.
  const unshown = table.unshownFilters(shapedField ? [color, shapedField.key] : [color]);

  const selectedIds = new Set(selected.map(({ sample_id }) => sample_id));

  const plotted = samples.flatMap((sample): Point<PointMeta<T>>[] => {
    const x = getX(sample);
    const y = getY(sample);
    if (x == null || y == null) return [];
    const isSelected = selectedIds.has(sample.sample_id);
    const faded = !passesFilters(sample, filters)
      ? "filtered"
      : selectedIds.size > 0 && !isSelected
        ? "unselected"
        : null;
    return [
      {
        x,
        y,
        r: isSelected && !faded ? 6 : 4,
        color: colorOf(color, groupOf(color, sample)),
        // Undefined where nothing is shaped, leaving the default to the plot.
        shape: shapedField ? shapeOf(shapes, groupOf(shapedField.key, sample)) : undefined,
        metaData: { sample, faded },
      },
    ];
  });

  // Neutral groups first, so they're drawn beneath the rest.
  const isNeutral = ({ metaData }: Point<PointMeta<T>>) => isNeutralGroup(groupOf(color, metaData!.sample));
  const { points, shown } = dimHidden(
    [...plotted.filter(isNeutral), ...plotted.filter((point) => !isNeutral(point))],
    (point) => point.metaData!.faded === null
  );

  const selectPoints = (picked: Point<PointMeta<T>>[]) => {
    // A filtered-out sample stays out of play; the rest are faded only by the selection being added to.
    const added = picked
      .filter(({ metaData }) => metaData!.faded !== "filtered")
      .map(({ metaData }) => metaData!.sample);
    setSelected([...selected, ...added.filter(({ sample_id }) => !selectedIds.has(sample_id))]);
  };

  const togglePoint = ({ metaData }: Point<PointMeta<T>>) => {
    if (metaData!.faded === "filtered") return;
    const { sample } = metaData!;
    setSelected(
      selectedIds.has(sample.sample_id)
        ? selected.filter(({ sample_id }) => sample_id !== sample.sample_id)
        : [...selected, sample]
    );
  };

  if (plotted.length === 0) return null;

  return (
    <Stack width="100%" height="100%" gap={1}>
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <TextField
          select
          size="small"
          label="Color by"
          value={color}
          onChange={(event) => setColor(event.target.value as Field)}
          slotProps={SELECT_SLOT_PROPS}
          sx={SELECT_SX}
        >
          {fields.map(({ key, label }) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <ShapeSelect fields={fields} shapeable={shapeable} value={shapedField?.key ?? NO_SHAPE} onChange={setShape} />
        {axisSelectors}
      </Stack>
      <LinkedPlot
        points={points}
        shown={shown}
        onSelectPoints={selectPoints}
        onTogglePoint={togglePoint}
        tooltipFields={fields}
        leftAxisLabel={leftAxisLabel}
        bottomAxisLabel={bottomAxisLabel}
        loading={loading}
        downloadFileName={downloadFileName}
        plotRef={ref}
        renderLegend={({ hovered, legendHover, onLegendHover }) => (
          <>
            <FieldLegends
              rows={samples}
              filters={filters}
              color={{ key: color, label: fields.find(({ key }) => key === color)!.label }}
              shape={shapedField && shapes && { key: shapedField.key, label: shapedField.label, scale: shapes }}
              onToggle={table.toggleFilter}
              ringed={(field) =>
                hovered ? groupOf(field, hovered) : legendHover?.field === field ? legendHover.value : null
              }
              onHover={onLegendHover}
            />
            {unshown.length > 0 && (
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                <Typography variant="caption" color="text.secondary">
                  Also filtered in the table by {listOf(unshown)}.
                </Typography>
                <Button size="small" onClick={table.clearFilters} sx={{ py: 0 }}>
                  Clear all filters
                </Button>
              </Stack>
            )}
          </>
        )}
      />
    </Stack>
  );
};

type ShapeSelectProps = {
  fields: readonly FieldDefinition[];
  /** The fields that fit the shape scale; the rest are listed disabled, with the reason. */
  shapeable: readonly FieldDefinition[];
  value: ShapeBy;
  onChange: (value: ShapeBy) => void;
};

const ShapeSelect = ({ fields, shapeable, value, onChange }: ShapeSelectProps) => (
  <TextField
    select
    size="small"
    label="Shape by"
    value={value}
    onChange={(event) => onChange(event.target.value as ShapeBy)}
    slotProps={SELECT_SLOT_PROPS}
    sx={SELECT_SX}
  >
    <MenuItem value={NO_SHAPE}>None</MenuItem>
    {fields.map(({ key, label }) => {
      const fits = shapeable.some((option) => option.key === key);
      return (
        <MenuItem key={key} value={key} disabled={!fits}>
          {fits ? label : `${label} — too many values to shape by`}
        </MenuItem>
      );
    })}
  </TextField>
);

type LinkedPlotProps<T extends SampleRow> = {
  /** Every point, the faded ones first - what dimHidden returns. */
  points: Point<PointMeta<T>>[];
  /** The points in focus, which a hovered chip can swell. */
  shown: Point<PointMeta<T>>[];
  onSelectPoints: (points: Point<PointMeta<T>>[]) => void;
  onTogglePoint: (point: Point<PointMeta<T>>) => void;
  /** The fields a hover names, in order. */
  tooltipFields: readonly FieldDefinition[];
  leftAxisLabel: string;
  bottomAxisLabel: string;
  loading: boolean;
  downloadFileName: string;
  plotRef?: Ref<DownloadPlotHandle>;
  /**
   * The legends, built for the current hover: `hovered` is the sample under the cursor, whose chips
   * to ring, and `onLegendHover` reports the chip under it.
   */
  renderLegend: (hover: {
    hovered: SampleGroups | null;
    legendHover: GroupHover | null;
    onLegendHover: (hover: GroupHover | null) => void;
  }) => ReactNode;
};

/**
 * The legend and plot, holding the hover between them. Kept apart from the point maths so a hover
 * re-renders only this: React Compiler would otherwise rebuild the points on every hover, restarting
 * ScatterPlot's hover animation - see ExplorerPlot.
 */
const LinkedPlot = <T extends SampleRow>({
  points,
  shown,
  onSelectPoints,
  onTogglePoint,
  tooltipFields,
  leftAxisLabel,
  bottomAxisLabel,
  loading,
  downloadFileName,
  plotRef,
  renderLegend,
}: LinkedPlotProps<T>) => {
  const theme = useTheme();
  // Both ways: a hovered point rings its chips, and a hovered chip swells its points.
  const [plotHover, setPlotHover] = useState<SampleGroups | null>(null);
  const [legendHover, setLegendHover] = useState<GroupHover | null>(null);

  return (
    <>
      {renderLegend({ hovered: plotHover, legendHover, onLegendHover: setLegendHover })}
      <Box sx={{ flexGrow: 1, minWidth: 0, minHeight: 0 }}>
        <ScatterPlot
          ref={plotRef}
          pointData={points}
          loading={loading}
          selectable
          onSelectionChange={onSelectPoints}
          onPointClicked={onTogglePoint}
          // Only points in focus, so the chip of a faded group swells nothing.
          hoveredPoints={
            legendHover
              ? shown.filter(({ metaData }) => groupOf(legendHover.field, metaData!.sample) === legendHover.value)
              : undefined
          }
          onHoveredPointChange={(point) => setPlotHover(point?.metaData?.sample ?? null)}
          tooltipBody={({ metaData }) => {
            const { sample, faded } = metaData!;
            return (
              <PlotTooltip
                title={sample.sample_id}
                // Faded points can win the hit test, so a faded sample says why it's faded.
                note={faded ? FADED_NOTES[faded] : undefined}
                rows={
                  sample.qc
                    ? [{ label: "Sample", value: "QC / reference" }]
                    : tooltipFields.map(({ key, label }) => ({ label, value: labelOf(key, groupOf(key, sample)) }))
                }
              />
            );
          }}
          controlsHighlight={theme.palette.primary.main}
          controlsPosition="right"
          miniMap={MINIMAP}
          leftAxisLabel={leftAxisLabel}
          bottomAxisLabel={bottomAxisLabel}
          downloadFileName={downloadFileName}
          animation="scale"
          animationBuffer={0.025}
          animationGroupSize={50}
        />
      </Box>
    </>
  );
};

export default DimensionalityScatterPlot;
