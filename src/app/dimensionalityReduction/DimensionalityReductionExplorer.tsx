"use client";

import { getSharedDomains, sweptValues, type Point, type RampRange } from "@weng-lab/visualization";
import { getOmeLabel } from "@/app/omes/omeContent";
import { shapeOf } from "@/common/components/pointShapes";
import { toLogValue } from "@/common/quantification";
import FieldLegends from "@/common/sampleFields/FieldLegends";
import {
  QC_GROUP,
  colorOf,
  fieldsFor,
  groupOf,
  isField,
  isNeutralGroup,
  type Field,
} from "@/common/sampleFields/fields";
import { passesFilters, toHiddenSets, type Filters } from "@/common/sampleFields/groups";
import { shapeOptions, shapingOf } from "@/common/sampleFields/shapes";
import ControlPanel from "./components/ControlPanel";
import ExplorerLayout from "./components/ExplorerLayout";
import ExplorerPlot, { type PointMeta } from "./components/ExplorerPlot";
import FeatureLegend from "./legends/FeatureLegend";
import MetricLegend from "./legends/MetricLegend";
import { colorLabel, isContinuous } from "./model/colorBy";
import { FEATURE_KINDS, featureLabel, isFeatureColor } from "./model/features";
import { isMetric, metricColor, metricDefinition } from "./model/metrics";
import { OME_CAPABILITIES, pcLabel } from "./model/omes";
import { allRows, rowsFor } from "./model/rows";
import type { ExplorerData, ExplorerRow } from "./model/types";
import { toggleHidden } from "./state/params";
import { useColorRange } from "./state/useColorRange";
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

  const { ome, method, x, y, color, hideQc } = state;
  const featureKind = OME_CAPABILITIES[ome].feature;
  // Null, skipping the fetch, unless a feature colors the plot.
  const feature = useFeature(ome, isFeatureColor(color) ? state.feature : null);
  const { pve } = data[ome];
  const rows = rowsFor(data, ome, method);
  const fields = fieldsFor(ome);

  // What the URL asks to shape by, if the data can carry it. Shapes are assigned across every ome.
  const everyRow = allRows(data);
  const shaping = shapingOf(state.shape, shapeOptions(fields, everyRow), everyRow);

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
  const { range, control: rangeControl } = useColorRange(state, setState, allValues);

  const rampFill = metricColor(range);

  /** A row's color, and for a ramp its value on it, which a colorbar sweep matches against. */
  const paint = (row: ExplorerRow) => {
    if (isContinuous(color)) {
      const value = continuousValue(row);
      return { fill: rampFill(value), neutral: value === null, rampValue: value };
    }
    const group = groupOf(color, row);
    return { fill: colorOf(color, group), neutral: isNeutralGroup(group), rampValue: null };
  };

  const painted = rows.map((row) => ({
    row,
    ...paint(row),
    // Undefined where nothing is shaped, leaving the default to the plot.
    shape: shaping ? shapeOf(shaping.scale, groupOf(shaping.key, row)) : undefined,
    // Raw, not logged, for the hover to quote.
    featureValue: feature.values?.get(row.sample_id) ?? null,
  }));

  // Neutral groups first, so they're drawn beneath the rest.
  const points = [...painted.filter(({ neutral }) => neutral), ...painted.filter(({ neutral }) => !neutral)].map(
    ({ row, fill, shape, featureValue, rampValue }): Point<PointMeta> => {
      const [px, py] = method === "UMAP" && row.umap ? row.umap : [row.pcs[x - 1], row.pcs[y - 1]];
      return {
        x: px,
        y: py,
        r: 4,
        color: fill,
        shape,
        // Filtered samples are dimmed rather than dropped: a sample's place only means something beside the rest.
        dimmed: !passesFilters(row, filters),
        metaData: { row, featureValue, rampValue },
      };
    }
  );
  const shown = points.filter(({ dimmed }) => !dimmed);

  // From every point, so filtering never rescales the axes.
  const domains = points.length > 0 ? getSharedDomains(points) : undefined;

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
            shaping && `Shaped by ${shaping.label}`,
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
            const sweep = legendHover?.kind === "range" ? legendHover.sweep : null;
            const onSweep = (next: RampRange | null) =>
              onLegendHover(
                next === null || range === null
                  ? null
                  : { kind: "range", sweep: next, within: sweptValues(range, next) }
              );
            return (
              <>
                <FieldLegends
                  rows={rows}
                  filters={filters}
                  listed={(row) => passesFilters(row, filters)}
                  color={isField(color) ? { key: color, label: colorLabel(ome, color) } : null}
                  shape={shaping}
                  onToggle={(field, value) =>
                    setState(value === QC_GROUP ? { ...state, hideQc: !hideQc } : toggleHidden(state, field, value))
                  }
                  ringed={ringed}
                  onHover={(hover) => onLegendHover(hover && { kind: "group", ...hover })}
                />
                {isFeatureColor(color)
                  ? // Always set here (normalize ensures it); checked for the types.
                    featureKind && (
                      <FeatureLegend
                        kind={featureKind}
                        feature={feature}
                        range={range}
                        values={shownValues}
                        missing={shown.filter(({ metaData }) => metaData!.featureValue === null).length}
                        hovered={hoveredValue === undefined ? null : toLogValue(hoveredValue)}
                        sweep={sweep}
                        onSweep={onSweep}
                        control={rangeControl}
                      />
                    )
                  : isMetric(color) && (
                      <MetricLegend
                        metric={metricDefinition(color)}
                        range={range}
                        values={shownValues}
                        missing={
                          shown.filter(({ metaData }) => (metaData!.row.metrics?.[color] ?? null) === null).length
                        }
                        hovered={hovered?.metrics?.[color] ?? null}
                        sweep={sweep}
                        onSweep={onSweep}
                        control={rangeControl}
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
