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
import ControlPanel from "./ControlPanel";
import ExplorerLayout from "./ExplorerLayout";
import ExplorerPlot, { type PointMeta } from "./ExplorerPlot";
import { FEATURE_COLOR, FEATURE_KINDS, featureLabel, fromLogValue, toLogValue } from "./features";
import FeatureLegend from "./FeatureLegend";
import MetricLegend, { type ColorRangeControl } from "./MetricLegend";
import { QC_GROUP, colorLabel, colorOf, fieldsFor, groupOf, isContinuous, isNeutralGroup, type Field } from "./fields";
import { legendGroups, passesFilters, rowsFor, toHiddenSets, type Filters } from "./groups";
import ShapeLegend from "./ShapeLegend";
import { defaultRange, isMetric, metricColor, metricDefinition, metricPosition, scaleOver } from "./metrics";
import { OME_CAPABILITIES, pcLabel } from "./omes";
import { toggleHidden, type ExplorerState } from "./params";
import { NO_SHAPE, shapeOf, shapeOptionsFor, shapeScale } from "./shapes";
import type { ExplorerData, ExplorerRow } from "./types";
import { useExplorerState } from "./useExplorerState";
import { useFeature } from "./useFeature";

export type DimensionalityReductionExplorerProps = {
  data: ExplorerData;
};

/**
 * Note what this component deliberately does not hold: the hover.
 *
 * React Compiler memoizes in scopes, and it puts neighbouring values in one scope together - so
 * hover state here would land in the same scope as `points` and `domains` and rebuild both on every
 * point the cursor crosses. ScatterPlot cancels its hover growth when those arrays change identity,
 * which left a hovered point drawn at zero growth while the same hover from a legend chip animated
 * in full. The hover therefore lives in ExplorerPlot, and the legend is built through a callback.
 */
const DimensionalityReductionExplorer = ({ data }: DimensionalityReductionExplorerProps) => {
  const [state, setState] = useExplorerState();
  // Where the colors stop while the range editor is open, written to the URL once it closes. The
  // URL is costly to write often: Safari allows 100 history updates in 30 seconds, and each one
  // re-renders the page through Next's router - fast enough, from a held arrow key or a run of
  // clicks along the track, that React gives up with "Maximum update depth exceeded". Held with
  // the state it was set over, which is parsed afresh when the URL changes: once the URL carries
  // the range, or anything else moves it, the draft stops applying in the same render, so the
  // colors never fall back to the old range in between.
  const [draft, setDraft] = useState<{ range: ColorRange; over: ExplorerState } | null>(null);
  const draftRange = draft?.over === state ? draft.range : null;

  const { ome, method, x, y, color, hideQc } = state;
  // What one feature is on this ome - a gene, a lipid - or null where it has none to color by.
  const featureKind = OME_CAPABILITIES[ome].feature;
  // Fetched rather than carried on the row; null whenever a feature is not what colors the plot,
  // which is what skips the fetch. See useFeature.
  const feature = useFeature(ome, color === FEATURE_COLOR ? state.feature : null);
  const { pve } = data[ome];
  const rows = rowsFor(data, ome, method);
  const fields = fieldsFor(ome);

  // The field actually shaping the plot: what the URL asks for, if this ome's data can carry it.
  const shapeOptions = shapeOptionsFor(ome, data);
  const shapedField = state.shape === NO_SHAPE ? null : (shapeOptions.find(({ key }) => key === state.shape) ?? null);
  const shapes = shapedField ? shapeScale(data, shapedField.key) : null;

  // The shape encoding gets a legend of its own only where the two encodings disagree. Where one
  // field drives both, the color chips carry its glyphs instead, which says it once rather than twice.
  const shapeLegend = shapedField && shapes && shapedField.key !== color ? { field: shapedField, scale: shapes } : null;

  const filters: Filters = {
    fields: fields.map(({ key }) => key),
    hidden: toHiddenSets(state.hidden),
    hideQc,
  };

  /**
   * A row's place on whichever ramp is colouring the plot, in that ramp's own units: a metric as
   * the API reports it, a feature as log10(value + 1). Null where the sample has no value, which is
   * also what every sample has before a feature is picked.
   */
  const continuousValue = (row: ExplorerRow): number | null => {
    if (isMetric(color)) return row.metrics?.[color] ?? null;
    const value = feature.values?.get(row.sample_id);
    return value === undefined ? null : toLogValue(value);
  };

  // Across every sample the ome has, whatever the method or filters, so neither can repaint a point.
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

  /**
   * A row's color: by group for a field, along the ramp for a metric or a feature - and for the
   * latter where on the ramp, which is what a sweep along the colorbar is matched against.
   */
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
    // Undefined rather than "circle" where nothing is shaped, so the plot falls back to its own
    // default rather than this being a second place that decides what an unshaped point looks like.
    shape: shapedField ? shapeOf(shapes, groupOf(shapedField.key, row)) : undefined,
    // The raw value, not the log the ramp uses: this is for the hover to quote, in the data's units.
    featureValue: feature.values?.get(row.sample_id) ?? null,
  }));

  // The neutral groups first, so QC samples and missing values are drawn beneath the samples they
  // would otherwise cover; each layer keeps the API's order.
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

  // From every point rather than the ones in focus, so filtering never rescales the axes under
  // the points that keep their color.
  const domains = plotted.length > 0 ? getSharedDomains(plotted) : undefined;

  // Filtered samples stay on the plot, pale and underneath, rather than being dropped: where a
  // sample sits in a reduction only means anything beside the samples it was reduced with.
  const { points, shown } = dimHidden(plotted, (point) => point.metaData!.shown);

  // What the colorbar's histogram counts: the samples in focus, as the plot shows them in color.
  const shownValues = Float64Array.from(shown.flatMap(({ metaData }) => continuousValue(metaData!.row) ?? [])).sort();

  const pca = method === "PCA";

  return (
    <ExplorerLayout
      panel={
        <ControlPanel
          state={state}
          onChange={setState}
          data={data}
          // The id until the query names it, so a link opened with a gene already set says so at once.
          geneLabel={feature.name ?? feature.id}
        />
      }
      plot={
        <ExplorerPlot
          title={`${getOmeLabel(ome)} · ${method}`}
          subtitle={[
            `Colored by ${color === FEATURE_COLOR && featureKind ? featureLabel(featureKind, feature) : colorLabel(ome, color)}`,
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
            // Where the hovered sample sits on the ramp, in the ramp's units - undefined rather
            // than null so a sample with no value and no sample at all stay distinguishable.
            const hoveredValue = hovered ? feature.values?.get(hovered.sample_id) : undefined;
            // The chip to ring in one field's row: the group of the sample under the cursor on the
            // plot, or else the chip under the cursor - from this row, not the one above or below.
            const ringed = (field: Field) =>
              hovered
                ? groupOf(field, hovered)
                : legendHover?.kind === "group" && legendHover.field === field
                  ? legendHover.value
                  : null;
            // The stretch of colorbar under the cursor, drawn back onto the bar it came from.
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
                {color === FEATURE_COLOR ? (
                  // normalize keeps a feature coloring off an ome with no features, so the kind is
                  // always there; checked only so the types agree.
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
                    // Named only when a shape row sits above it, where two rows of chips would
                    // otherwise leave the reader to work out which encoding each one explains.
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
