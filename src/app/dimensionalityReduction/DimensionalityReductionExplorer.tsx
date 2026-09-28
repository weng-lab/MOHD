"use client";

import { getSharedDomains, type Point } from "@weng-lab/visualization";
import { useState } from "react";
import { getOmeLabel } from "@/app/omes/omeContent";
import {
  percentilePresets,
  sameRange,
  type ColorRange,
  type RampRange,
} from "@/common/components/Colorbar/colorbarAxis";
import PlotLegend from "@/common/components/PlotLegend";
import { dimHidden } from "@/common/components/plotDimming";
import ControlPanel from "./components/ControlPanel";
import ExplorerLayout from "./components/ExplorerLayout";
import ExplorerPlot, { type PointMeta } from "./components/ExplorerPlot";
import { FEATURE_KINDS, featureLabel, fromLogValue, isFeatureColor, toLogValue } from "./model/features";
import FeatureLegend from "./legends/FeatureLegend";
import MetricLegend, { type ColorRangeControl } from "./legends/MetricLegend";
import {
  QC_GROUP,
  colorLabel,
  colorOf,
  fieldsFor,
  groupOf,
  isContinuous,
  isNeutralGroup,
  type Field,
} from "./model/fields";
import { legendGroups, passesFilters, rowsFor, toHiddenSets, type Filters } from "./model/groups";
import ShapeLegend from "./legends/ShapeLegend";
import { defaultRange, isMetric, metricColor, metricDefinition, metricPosition, scaleOver } from "./model/metrics";
import { OME_CAPABILITIES, pcLabel } from "./model/omes";
import { toggleHidden, type ExplorerState } from "./state/params";
import { NO_SHAPE, shapeOf, shapeOptionsFor, shapeScale } from "./model/shapes";
import type { ExplorerData, ExplorerRow } from "./model/types";
import { useExplorerState } from "./state/useExplorerState";
import { useFeature } from "./data/useFeature";

export type DimensionalityReductionExplorerProps = {
  data: ExplorerData;
};

/**
 * Holds no hover state, deliberately: React Compiler would put it in one memo scope with `points`
 * and `domains`, rebuilding them on every hover and restarting ScatterPlot's hover animation. The
 * hover lives in ExplorerPlot, which builds the legend through a callback.
 */
const DimensionalityReductionExplorer = ({ data }: DimensionalityReductionExplorerProps) => {
  const [state, setState] = useExplorerState();
  // The range while the editor is open, written to the URL only on close: frequent URL writes hit
  // Safari's history limit and React's update depth. Keyed to the state it was set over, so it stops
  // applying as soon as the URL changes, without a flash of the old range.
  const [draft, setDraft] = useState<{ range: ColorRange; over: ExplorerState } | null>(null);
  const draftRange = draft?.over === state ? draft.range : null;

  const { ome, method, x, y, color, hideQc } = state;
  const featureKind = OME_CAPABILITIES[ome].feature;
  // Null, skipping the fetch, unless a feature colors the plot.
  const feature = useFeature(ome, isFeatureColor(color) ? state.feature : null);
  const { pve } = data[ome];
  const rows = rowsFor(data, ome, method);
  const fields = fieldsFor(ome);

  // What the URL asks to shape by, if this ome's data can carry it.
  const shapeOptions = shapeOptionsFor(ome, data);
  const shapedField = state.shape === NO_SHAPE ? null : (shapeOptions.find(({ key }) => key === state.shape) ?? null);
  const shapes = shapedField ? shapeScale(data, shapedField.key) : null;

  // A separate shape legend only when shape and color are different fields; otherwise the color chips show the glyphs.
  const shapeLegend = shapedField && shapes && shapedField.key !== color ? { field: shapedField, scale: shapes } : null;

  const filters: Filters = {
    fields: fields.map(({ key }) => key),
    hidden: toHiddenSets(state.hidden),
    hideQc,
  };

  /** A row's value on the ramp coloring the plot, in the ramp's units (log10(value + 1) for a feature), or null. */
  const continuousValue = (row: ExplorerRow): number | null => {
    if (isMetric(color)) return row.metrics?.[color] ?? null;
    const value = feature.values?.get(row.sample_id);
    return value === undefined ? null : toLogValue(value);
  };

  // Across every sample the ome has, so neither method nor filters can repaint a point.
  const allValues = isContinuous(color)
    ? Float64Array.from(data[ome].rows.flatMap((row) => continuousValue(row) ?? [])).sort()
    : new Float64Array();
  const hasValues = allValues.length > 0;
  const initialRange = hasValues ? defaultRange(allValues) : null;

  // A link holds the range in the data's own units; the ramp is drawn in log10 for a feature.
  const [toRamp, fromRamp] = isMetric(color) ? [(v: number) => v, (v: number) => v] : [toLogValue, fromLogValue];
  const savedRange: ColorRange | null = state.range && [toRamp(state.range[0]), toRamp(state.range[1])];
  const colorRange = draftRange ?? savedRange ?? initialRange;
  const scale = hasValues && colorRange ? scaleOver(allValues, colorRange) : null;

  const rangeControl: ColorRangeControl | undefined =
    hasValues && initialRange
      ? {
          defaultRange: initialRange,
          extent: [allValues[0], allValues[allValues.length - 1]],
          presets: percentilePresets(allValues),
          onChange: (range) => setDraft({ range, over: state }),
          onClose: () => {
            if (!draftRange) return;
            // The default is left out of the link, as every other default is.
            setState({
              ...state,
              range: sameRange(draftRange, initialRange) ? null : [fromRamp(draftRange[0]), fromRamp(draftRange[1])],
            });
          },
        }
      : undefined;

  /** A row's color, and for a ramp its position on it, which a colorbar sweep matches against. */
  const paint = (row: ExplorerRow) => {
    if (isContinuous(color)) {
      const value = continuousValue(row);
      return {
        fill: metricColor(scale, value),
        neutral: value === null,
        rampPosition: scale && value !== null ? metricPosition(scale, value) : null,
      };
    }
    const group = groupOf(color, row);
    return { fill: colorOf(color, group), neutral: isNeutralGroup(group), rampPosition: null };
  };

  const painted = rows.map((row) => ({
    row,
    ...paint(row),
    // Undefined where nothing is shaped, leaving the default to the plot.
    shape: shapedField ? shapeOf(shapes, groupOf(shapedField.key, row)) : undefined,
    // Raw, not logged, for the hover to quote.
    featureValue: feature.values?.get(row.sample_id) ?? null,
  }));

  // Neutral groups first, so they're drawn beneath the rest.
  const plotted = [...painted.filter(({ neutral }) => neutral), ...painted.filter(({ neutral }) => !neutral)].map(
    ({ row, fill, shape, featureValue, rampPosition }): Point<PointMeta> => {
      const [px, py] = method === "UMAP" && row.umap ? row.umap : [row.pcs[x - 1], row.pcs[y - 1]];
      return {
        x: px,
        y: py,
        r: 4,
        color: fill,
        shape,
        metaData: { row, shown: passesFilters(row, filters), featureValue, rampPosition },
      };
    }
  );

  // From every point, so filtering never rescales the axes.
  const domains = plotted.length > 0 ? getSharedDomains(plotted) : undefined;

  // Filtered samples are dimmed rather than dropped: a sample's place only means something beside the rest.
  const { points, shown } = dimHidden(plotted, (point) => point.metaData!.shown);

  // The samples in focus, for the colorbar's histogram.
  const shownValues = Float64Array.from(shown.flatMap(({ metaData }) => continuousValue(metaData!.row) ?? [])).sort();

  const pca = method === "PCA";

  return (
    <ExplorerLayout
      panel={
        <ControlPanel
          state={state}
          onChange={setState}
          data={data}
          // The id until the query returns a name.
          geneLabel={feature.name ?? feature.id}
        />
      }
      plot={
        <ExplorerPlot
          title={`${getOmeLabel(ome)} · ${method}`}
          subtitle={[
            `Colored by ${isFeatureColor(color) && featureKind ? featureLabel(featureKind, feature) : colorLabel(ome, color)}`,
            shapedField && `Shaped by ${shapedField.label}`,
            pca && `PC${x} vs PC${y}`,
          ]
            .filter(Boolean)
            .join(" · ")}
          viewKey={`${ome}-${method}-${x}-${y}`}
          points={points}
          shown={shown}
          domains={domains}
          xLabel={pca ? pcLabel(x, pve) : "UMAP-1"}
          yLabel={pca ? pcLabel(y, pve) : "UMAP-2"}
          feature={
            featureKind && feature.name ? { name: feature.name, format: FEATURE_KINDS[featureKind].format } : null
          }
          renderLegend={({ hovered, legendHover, onLegendHover }) => {
            // The hovered sample's raw feature value; undefined with no hover or no value.
            const hoveredValue = hovered ? feature.values?.get(hovered.sample_id) : undefined;
            // The chip to ring in a field's row: the hovered sample's group, or the hovered chip if it's in this row.
            const ringed = (field: Field) =>
              hovered
                ? groupOf(field, hovered)
                : legendHover?.kind === "group" && legendHover.field === field
                  ? legendHover.value
                  : null;
            const sweep = legendHover?.kind === "range" ? legendHover : null;
            const onSweep = (next: RampRange | null) =>
              onLegendHover(next === null ? null : { kind: "range", ...next });
            return (
              <>
                {shapeLegend && (
                  <ShapeLegend
                    label={shapeLegend.field.label}
                    scale={shapeLegend.scale}
                    groups={legendGroups(rows, shapeLegend.field.key, filters)}
                    hidden={filters.hidden[shapeLegend.field.key]}
                    onToggle={(value) => setState(toggleHidden(state, shapeLegend.field.key, value))}
                    highlighted={ringed(shapeLegend.field.key)}
                    onHover={(value) =>
                      onLegendHover(value === null ? null : { kind: "group", field: shapeLegend.field.key, value })
                    }
                  />
                )}
                {isFeatureColor(color) ? (
                  // Always set here (normalize ensures it); checked for the types.
                  featureKind && (
                    <FeatureLegend
                      kind={featureKind}
                      feature={feature}
                      scale={scale}
                      values={shownValues}
                      missing={shown.filter(({ metaData }) => metaData!.featureValue === null).length}
                      hovered={hoveredValue === undefined ? null : toLogValue(hoveredValue)}
                      sweep={sweep}
                      onSweep={onSweep}
                      control={rangeControl}
                    />
                  )
                ) : isMetric(color) ? (
                  <MetricLegend
                    metric={metricDefinition(color)}
                    scale={scale}
                    values={shownValues}
                    missing={shown.filter(({ metaData }) => (metaData!.row.metrics?.[color] ?? null) === null).length}
                    hovered={hovered?.metrics?.[color] ?? null}
                    sweep={sweep}
                    onSweep={onSweep}
                    control={rangeControl}
                  />
                ) : (
                  <PlotLegend
                    // Named only beneath a shape row, to tell the two apart.
                    label={shapeLegend ? colorLabel(ome, color) : undefined}
                    groups={legendGroups(rows, color, filters).map((group) =>
                      shapes && shapedField?.key === color ? { ...group, shape: shapeOf(shapes, group.value) } : group
                    )}
                    // The QC chip toggles hideQc rather than a value on the colored field - see QC_GROUP.
                    hidden={hideQc ? new Set([...filters.hidden[color], QC_GROUP]) : filters.hidden[color]}
                    onToggle={(value) =>
                      setState(value === QC_GROUP ? { ...state, hideQc: !hideQc } : toggleHidden(state, color, value))
                    }
                    highlighted={ringed(color)}
                    onHover={(value) => onLegendHover(value === null ? null : { kind: "group", field: color, value })}
                  />
                )}
              </>
            );
          }}
          downloadFileName={`MOHD_${ome}_${method}`}
        />
      }
    />
  );
};

export default DimensionalityReductionExplorer;
