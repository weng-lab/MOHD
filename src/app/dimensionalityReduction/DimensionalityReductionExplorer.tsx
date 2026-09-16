"use client";

import { getSharedDomains, type Point } from "@weng-lab/visualization";
import { useState } from "react";
import { getOmeLabel } from "@/app/omes/omeContent";
import ControlPanel from "./ControlPanel";
import ExplorerLayout from "./ExplorerLayout";
import ExplorerPlot, { type PointMeta } from "./ExplorerPlot";
import { QC_GROUP, colorOf, fieldsFor, groupOf, isGreyGroup } from "./fields";
import { legendGroups, passesFilters, toHiddenSets, valuesOf, type Filters } from "./groups";
import { pcLabel } from "./omes";
import { toggleHidden } from "./params";
import type { ExplorerData } from "./types";
import { useExplorerState } from "./useExplorerState";

export type DimensionalityReductionExplorerProps = {
  data: ExplorerData;
};

const DimensionalityReductionExplorer = ({ data }: DimensionalityReductionExplorerProps) => {
  const [state, setState] = useExplorerState();
  // The highlight runs both ways, as on the WGS page. plotHover is the group under the cursor in
  // the plot, and rings its chip; legendHover is the chip under the cursor, handed back to the plot
  // so its group swells. Kept apart so neither can feed the other back into itself.
  const [plotHover, setPlotHover] = useState<string | null>(null);
  const [legendHover, setLegendHover] = useState<string | null>(null);

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

  const points = rows
    .map((row): Point<PointMeta> => {
      const [px, py] = method === "UMAP" && row.umap ? row.umap : [row.pcs[x - 1], row.pcs[y - 1]];
      const group = groupOf(color, row);
      return { x: px, y: py, r: 4, color: colorOf(color, group), metaData: { row, group } };
    })
    // Grey groups first, so QC and unknown samples are drawn beneath the participants they would
    // otherwise cover. The sort is stable, so each layer keeps the API's order.
    .sort((a, b) => Number(!isGreyGroup(a.metaData!.group)) - Number(!isGreyGroup(b.metaData!.group)));

  // From every point rather than the visible ones, so filtering never rescales the axes under
  // the points that remain.
  const domains = points.length > 0 ? getSharedDomains(points) : undefined;
  const visible = points.filter((point) => passesFilters(point.metaData!.row, filters));
  // From the visible points, so hovering the chip of a hidden group highlights nothing.
  const hoveredPoints = legendHover ? visible.filter((point) => point.metaData!.group === legendHover) : undefined;

  const pca = method === "PCA";
  const colorLabel = fields.find(({ key }) => key === color)?.label;

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
          subtitle={`Colored by ${colorLabel}${pca ? ` · PC${x} vs PC${y}` : ""}`}
          viewKey={`${ome}-${method}-${x}-${y}`}
          points={visible}
          total={points.length}
          domains={domains}
          xLabel={pca ? pcLabel(x, pve) : "UMAP-1"}
          yLabel={pca ? pcLabel(y, pve) : "UMAP-2"}
          groups={legendGroups(rows, color, filters)}
          // The QC chip toggles hideQc rather than a value on the colored field - see QC_GROUP.
          hidden={hideQc ? new Set([...filters.hidden[color], QC_GROUP]) : filters.hidden[color]}
          onToggle={(value) =>
            setState(value === QC_GROUP ? { ...state, hideQc: !hideQc } : toggleHidden(state, color, value))
          }
          highlighted={plotHover ?? legendHover}
          onLegendHover={setLegendHover}
          hoveredPoints={hoveredPoints}
          onPlotHover={setPlotHover}
          downloadFileName={`MOHD_${ome}_${method}`}
        />
      }
    />
  );
};

export default DimensionalityReductionExplorer;
