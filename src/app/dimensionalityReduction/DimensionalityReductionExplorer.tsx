"use client";

import { getSharedDomains, type Point } from "@weng-lab/visualization";
import { getOmeLabel } from "@/app/omes/omeContent";
import PlotLegend from "@/common/components/PlotLegend";
import { dimHidden } from "@/common/components/plotDimming";
import ControlPanel from "./ControlPanel";
import { EXPRESSION_COLOR, expressionLabel, toLogTpm } from "./expression";
import ExpressionLegend from "./ExpressionLegend";
import ExplorerLayout from "./ExplorerLayout";
import ExplorerPlot, { type PointMeta } from "./ExplorerPlot";
import MetricLegend from "./MetricLegend";
import { QC_GROUP, colorLabel, colorOf, fieldsFor, groupOf, isContinuous, isNeutralGroup, type Field } from "./fields";
import { legendGroups, passesFilters, toHiddenSets, valuesOf, type Filters } from "./groups";
import ShapeLegend from "./ShapeLegend";
import { isMetric, metricColor, metricDefinition, metricScale } from "./metrics";
import { pcLabel } from "./omes";
import { toggleHidden } from "./params";
import { NO_SHAPE, shapeOf, shapeOptionsFor, shapeScale } from "./shapes";
import type { ExplorerData, ExplorerRow } from "./types";
import { useExplorerState } from "./useExplorerState";
import { useGeneExpression } from "./useGeneExpression";

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

  const { ome, method, x, y, color, hideQc } = state;
  // Fetched rather than carried on the row; null whenever a gene is not what colors the plot, which
  // is what skips the query. See useGeneExpression.
  const gene = useGeneExpression(color === EXPRESSION_COLOR ? state.gene : null);
  const { pve } = data[ome];
  // Every row has PCs - the server drops any without - but UMAP coordinates are checked per row.
  const rows = method === "UMAP" ? data[ome].rows.filter((row) => row.umap) : data[ome].rows;
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
   * the API reports it, expression as log10(TPM + 1). Null where the sample has no value, which is
   * also what every sample has before a gene is picked.
   */
  const continuousValue = (row: ExplorerRow): number | null => {
    if (isMetric(color)) return row.metrics?.[color] ?? null;
    const tpm = gene.values?.get(row.sample_id);
    return tpm === undefined ? null : toLogTpm(tpm);
  };

  // Across every sample the ome has, whatever the method or filters, so neither can repaint a point.
  const scale = isContinuous(color) ? metricScale(data[ome].rows.flatMap((row) => continuousValue(row) ?? [])) : null;

  /** A row's color: by group for a field, along the ramp for a metric or a gene. */
  const paint = (row: ExplorerRow) => {
    if (isContinuous(color)) {
      const value = continuousValue(row);
      return { fill: metricColor(scale, value), neutral: value === null };
    }
    const group = groupOf(color, row);
    return { fill: colorOf(color, group), neutral: isNeutralGroup(group) };
  };

  const painted = rows.map((row) => ({
    row,
    ...paint(row),
    // Undefined rather than "circle" where nothing is shaped, so the plot falls back to its own
    // default rather than this being a second place that decides what an unshaped point looks like.
    shape: shapedField ? shapeOf(shapes, groupOf(shapedField.key, row)) : undefined,
    // Raw TPM, not the log the ramp uses: this is for the hover to quote, and a reader reads TPM.
    expression: gene.values?.get(row.sample_id) ?? null,
  }));

  // The neutral groups first, so QC samples and missing values are drawn beneath the samples they
  // would otherwise cover; each layer keeps the API's order.
  const plotted = [...painted.filter(({ neutral }) => neutral), ...painted.filter(({ neutral }) => !neutral)].map(
    ({ row, fill, shape, expression }): Point<PointMeta> => {
      const [px, py] = method === "UMAP" && row.umap ? row.umap : [row.pcs[x - 1], row.pcs[y - 1]];
      return {
        x: px,
        y: py,
        r: 4,
        color: fill,
        shape,
        metaData: { row, shown: passesFilters(row, filters), expression },
      };
    }
  );

  // From every point rather than the ones in focus, so filtering never rescales the axes under
  // the points that keep their color.
  const domains = plotted.length > 0 ? getSharedDomains(plotted) : undefined;

  // Filtered samples stay on the plot, pale and underneath, rather than being dropped: where a
  // sample sits in a reduction only means anything beside the samples it was reduced with.
  const { points, shown } = dimHidden(plotted, (point) => point.metaData!.shown);

  const pca = method === "PCA";

  return (
    <ExplorerLayout
      panel={
        <ControlPanel
          state={state}
          onChange={setState}
          pve={pve}
          options={Object.fromEntries(fields.map(({ key }) => [key, valuesOf(rows, key)]))}
          shapeOptions={shapeOptions}
          // The id until the query names it, so a link opened with a gene already set says so at once.
          geneLabel={gene.name ?? gene.id}
          hasQc={rows.some((row) => row.qc)}
        />
      }
      plot={
        <ExplorerPlot
          title={`${getOmeLabel(ome)} · ${method}`}
          subtitle={[
            `Colored by ${color === EXPRESSION_COLOR ? expressionLabel(gene) : colorLabel(ome, color)}`,
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
          expressionGene={gene.name}
          renderLegend={({ hovered, legendHover, onLegendHover }) => {
            // Where the hovered sample sits on the ramp, in the ramp's units - undefined rather
            // than null so a sample with no value and no sample at all stay distinguishable.
            const hoveredTpm = hovered ? gene.values?.get(hovered.sample_id) : undefined;
            // The chip to ring in one field's row: the group of the sample under the cursor on the
            // plot, or else the chip under the cursor - from this row, not the one above or below.
            const ringed = (field: Field) =>
              hovered ? groupOf(field, hovered) : legendHover && legendHover.field === field ? legendHover.value : null;
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
                    onHover={(value) => onLegendHover(value === null ? null : { field: shapeLegend.field.key, value })}
                  />
                )}
                {color === EXPRESSION_COLOR ? (
                  <ExpressionLegend
                    gene={gene}
                    scale={scale}
                    missing={shown.filter(({ metaData }) => metaData!.expression === null).length}
                    hovered={hoveredTpm === undefined ? null : toLogTpm(hoveredTpm)}
                  />
                ) : isMetric(color) ? (
                  <MetricLegend
                    metric={metricDefinition(color)}
                    scale={scale}
                    missing={shown.filter(({ metaData }) => (metaData!.row.metrics?.[color] ?? null) === null).length}
                    hovered={hovered?.metrics?.[color] ?? null}
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
                    onHover={(value) => onLegendHover(value === null ? null : { field: color, value })}
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
