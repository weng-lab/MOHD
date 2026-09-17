"use client";

import { getSharedDomains, type Point } from "@weng-lab/visualization";
import { getOmeLabel } from "@/app/omes/omeContent";
import PlotLegend from "@/common/components/PlotLegend";
import ControlPanel from "./ControlPanel";
import ExplorerLayout from "./ExplorerLayout";
import ExplorerPlot, { type PointMeta } from "./ExplorerPlot";
import MetricLegend from "./MetricLegend";
import { QC_GROUP, colorLabel, colorOf, fieldsFor, groupOf, isGreyGroup } from "./fields";
import { legendGroups, passesFilters, toHiddenSets, valuesOf, type Filters } from "./groups";
import { isMetric, metricColor, metricDefinition, metricScale } from "./metrics";
import { pcLabel } from "./omes";
import { toggleHidden } from "./params";
import type { ExplorerData, ExplorerRow } from "./types";
import { useExplorerState } from "./useExplorerState";

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
  const { pve } = data[ome];
  // Every row has PCs - the server drops any without - but UMAP coordinates are checked per row.
  const rows = method === "UMAP" ? data[ome].rows.filter((row) => row.umap) : data[ome].rows;
  const fields = fieldsFor(ome);

  const filters: Filters = {
    fields: fields.map(({ key }) => key),
    hidden: toHiddenSets(state.hidden),
    hideQc,
  };

  // Across every sample the ome has, whatever the method or filters, so neither can repaint a point.
  const scale = isMetric(color) ? metricScale(data[ome].rows.flatMap((row) => row.metrics?.[color] ?? [])) : null;

  /** A row's group and color: by group for a field, along the ramp for a metric. */
  const paint = (row: ExplorerRow) => {
    if (isMetric(color)) {
      const value = row.metrics?.[color] ?? null;
      return { group: null, fill: metricColor(scale, value), grey: value === null };
    }
    const group = groupOf(color, row);
    return { group, fill: colorOf(color, group), grey: isGreyGroup(group) };
  };

  const painted = rows.map((row) => ({ row, ...paint(row) }));

  // Grey first, so QC samples and missing values are drawn beneath the samples they would otherwise
  // cover; each layer keeps the API's order.
  const points = [...painted.filter(({ grey }) => grey), ...painted.filter(({ grey }) => !grey)].map(
    ({ row, group, fill }): Point<PointMeta> => {
      const [px, py] = method === "UMAP" && row.umap ? row.umap : [row.pcs[x - 1], row.pcs[y - 1]];
      return { x: px, y: py, r: 4, color: fill, metaData: { row, group } };
    }
  );

  // From every point rather than the visible ones, so filtering never rescales the axes under
  // the points that remain.
  const domains = points.length > 0 ? getSharedDomains(points) : undefined;
  const visible = points.filter((point) => passesFilters(point.metaData!.row, filters));

  const pca = method === "PCA";

  return (
    <ExplorerLayout
      panel={
        <ControlPanel
          state={state}
          onChange={setState}
          pve={pve}
          options={Object.fromEntries(fields.map(({ key }) => [key, valuesOf(rows, key)]))}
          hasQc={rows.some((row) => row.qc)}
        />
      }
      plot={
        <ExplorerPlot
          title={`${getOmeLabel(ome)} · ${method}`}
          subtitle={`Colored by ${colorLabel(ome, color)}${pca ? ` · PC${x} vs PC${y}` : ""}`}
          viewKey={`${ome}-${method}-${x}-${y}`}
          points={visible}
          total={points.length}
          domains={domains}
          xLabel={pca ? pcLabel(x, pve) : "UMAP-1"}
          yLabel={pca ? pcLabel(y, pve) : "UMAP-2"}
          grouped={!isMetric(color)}
          renderLegend={({ hovered, legendHover, onLegendHover }) =>
            isMetric(color) ? (
              <MetricLegend
                metric={metricDefinition(color)}
                scale={scale}
                missing={visible.filter(({ metaData }) => (metaData!.row.metrics?.[color] ?? null) === null).length}
                hovered={hovered?.metrics?.[color] ?? null}
              />
            ) : (
              <PlotLegend
                groups={legendGroups(rows, color, filters)}
                // The QC chip toggles hideQc rather than a value on the colored field - see QC_GROUP.
                hidden={hideQc ? new Set([...filters.hidden[color], QC_GROUP]) : filters.hidden[color]}
                onToggle={(value) =>
                  setState(value === QC_GROUP ? { ...state, hideQc: !hideQc } : toggleHidden(state, color, value))
                }
                highlighted={hovered ? groupOf(color, hovered) : legendHover}
                onHover={onLegendHover}
              />
            )
          }
          downloadFileName={`MOHD_${ome}_${method}`}
        />
      }
    />
  );
};

export default DimensionalityReductionExplorer;
