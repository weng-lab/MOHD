import { Heatmap, ColumnDatum, HeatmapProps, DownloadPlotHandle } from "@weng-lab/visualization";
import { Stack, Box, CircularProgress, Typography } from "@mui/material";
import { useState, type ReactElement, type ReactNode, type SVGProps } from "react";
import {
  ColorbarEnd,
  ColorbarGraphic,
  ColorRangeButton,
  SteadyText,
  colorbarDepth,
  clampedEnds,
  evenStops,
  formatRange,
  sweptValues,
  type ColorRange,
  type RampRange,
  type RampStop,
} from "@/common/legends";
import PaneFigure from "../PaneFigure";
import { PlotHeaderTitle } from "../PlotHeader";
import type { HeatmapColorbar } from "./heatmapColorScale";
import { useHeatmapCellSelection, CellSelectionSample } from "./useHeatmapCellSelection";

type HeatmapBin = Parameters<NonNullable<HeatmapProps["tooltipBody"]>>[0];

export type OmeHeatmapShellProps<TSample extends CellSelectionSample> = {
  loading: boolean;
  /** The samples the table's filters leave in, as the heatmap's columns. */
  samples: TSample[];
  /** How many samples there are before the table's filters, for the header's count. */
  total: number;
  heatmapData: ColumnDatum<TSample, Record<string, unknown>>[];
  selected: TSample[];
  setSelected: React.Dispatch<React.SetStateAction<TSample[]>>;
  autoSort: boolean;
  yLabel: string;
  downloadFileName: string;
  /** Given, with a colorbar, the range its colors span now - so a tooltip can say where a cell beyond it is colored. */
  tooltipBody: (bin: HeatmapBin, domain?: ColorRange) => ReactElement;
  ref?: React.RefObject<DownloadPlotHandle | null>;
  emptyMessage?: string;
  colorDomain?: HeatmapProps["colorDomain"];
  colors: HeatmapProps["colors"];
  /** In the header, e.g. a HeatmapScaleToggle - before the colors' range button, with a colorbar. */
  controls?: React.ReactNode;
  /**
   * Swaps the library's legend for a colorbar that can be swept to pick out a stretch of the scale,
   * and whose range can be moved - see AdjustableHeatmap. Its range starts at colorDomain.
   */
  colorbar?: HeatmapColorbar;
};

/** Every cell's count, sorted ascending: what the colorbar's histogram and counts bisect. */
const sortedCounts = (data: ColumnDatum[]) =>
  Float64Array.from(data.flatMap(({ rows }) => rows.flatMap(({ count }) => (count === null ? [] : [count])))).sort();

const OmeHeatmapShell = <TSample extends CellSelectionSample>({
  loading,
  samples,
  total,
  heatmapData,
  selected,
  setSelected,
  autoSort,
  yLabel,
  downloadFileName,
  tooltipBody,
  ref,
  emptyMessage = "No samples match the current table filters.",
  colorDomain,
  colors,
  controls,
  colorbar,
}: OmeHeatmapShellProps<TSample>) => {
  const { selectedCells, handleCellClick } = useHeatmapCellSelection(heatmapData, samples, selected, setSelected);

  if (loading) {
    return (
      <Stack width="100%" height="100%" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  const heatmap: AdjustableHeatmapProps["heatmap"] = {
    ref,
    data: heatmapData,
    colors,
    xLabel: "Dataset",
    yLabel,
    showLegend: true,
    downloadFileName,
    selectedCells,
    onClick: (bin) => handleCellClick(bin.datum.columnName),
    cellWidth: 25,
    cellHeight: 20,
    xLabelOrientation: "leftDiagonal",
    showMiniMap: true,
    scrollToSelection: !autoSort,
  };

  const title = <PlotHeaderTitle title="Samples" shown={samples.length} total={total} />;

  if (heatmapData.length === 0) {
    return (
      <PaneFigure title={title} controls={controls}>
        <Stack flexGrow={1} alignItems="center" justifyContent="center">
          <Typography color="text.secondary">{emptyMessage}</Typography>
        </Stack>
      </PaneFigure>
    );
  }

  // Sorted here, in a component with no hover state, so a sweep never sorts them again.
  const values = colorbar ? sortedCounts(heatmapData) : null;

  // A colorbar needs values to span; with none on screen, the library's plain legend stands in.
  return colorbar && colorDomain && values?.length ? (
    <AdjustableHeatmap
      heatmap={heatmap}
      title={title}
      controls={controls}
      tooltipBody={tooltipBody}
      colorbar={colorbar}
      defaultRange={colorDomain}
      values={values}
      stops={evenStops(colors)}
    />
  ) : (
    <PaneFigure title={title} controls={controls}>
      <Box sx={{ flexGrow: 1, minHeight: 0, minWidth: 0 }}>
        <Heatmap {...heatmap} colorDomain={colorDomain} tooltipBody={tooltipBody} />
      </Box>
    </PaneFigure>
  );
};

/**
 * The legend column's width: room for "≤ −16.4" in the library's 11px legend font, which is wider
 * than the bar. Also the room either end label has, lying down across the expanded minimap.
 */
const LEGEND_WIDTH = 64;
/** Room above and below the bar for its end labels. */
const LABEL_SPACE = 18;
/** The library's own legend text, so the colorbar matches the axes it sits beside, and downloads the same. */
const LABEL_TEXT = { fontSize: 11, fontFamily: "sans-serif", fill: "#4d4f52" } as const;

type AdjustableHeatmapProps = {
  heatmap: Omit<HeatmapProps, "colorDomain" | "tooltipBody" | "renderLegend" | "legendWidth" | "highlightRange">;
  title: ReactNode;
  controls?: ReactNode;
  tooltipBody: OmeHeatmapShellProps<CellSelectionSample>["tooltipBody"];
  colorbar: HeatmapColorbar;
  /** Where the colors stop until the reader moves them. */
  defaultRange: ColorRange;
  /** Every cell's count, sorted ascending. */
  values: Float64Array;
  stops: RampStop[];
};

/**
 * The heatmap with a colorbar of its own standing where the library's legend stood, and the button
 * that moves its range in the header, after the scale toggle.
 *
 * Sweeping the colorbar fades every cell outside the window under the cursor, in the grid and the
 * minimap alike, so the cells in one stretch of the scale - the outliers past ±3, say - show wherever
 * they are, without widening the range and washing out the rest. Moving the range recolors the grid
 * through colorDomain alone: the cells are drawn unclamped and the library holds colors at the ends,
 * so nothing is rebuilt as a handle is dragged.
 *
 * The range and the sweep live here, below whatever builds the grid's data, so neither re-renders it.
 */
const AdjustableHeatmap = ({
  heatmap,
  title,
  controls,
  tooltipBody,
  colorbar,
  defaultRange,
  values,
  stops,
}: AdjustableHeatmapProps) => {
  // Kept with the mode it was set in. Another mode's scale is in other units, so it starts at its own
  // default rather than reading this range in the wrong ones; switching back finds it as it was left.
  const [adjusted, setAdjusted] = useState<{ mode: string; range: ColorRange } | null>(null);
  const [sweep, setSweep] = useState<RampRange | null>(null);
  // Whether the range editor is open, while which the button's range holds its width - see SteadyText.
  const [editing, setEditing] = useState(false);
  const range = adjusted?.mode === colorbar.mode ? adjusted.range : defaultRange;
  const { kind, format } = colorbar;

  // Said of the cells on screen; the editor reaches every cell's value, shown or not.
  const clamped = clampedEnds(values, range);
  const [low, high] = range;

  return (
    <PaneFigure
      title={title}
      controls={
        <>
          {controls}
          <ColorRangeButton
            // One span, so the space after "Colors" survives the button's flexbox.
            label={
              <span>
                Colors <SteadyText text={formatRange(kind, range, format)} hold={editing} />
              </span>
            }
            stops={stops}
            kind={kind}
            range={range}
            defaultRange={defaultRange}
            extent={colorbar.extent}
            values={values}
            presets={colorbar.presets}
            format={format}
            noun="cell"
            notes={colorbar.notes}
            onChange={(next) => setAdjusted({ mode: colorbar.mode, range: next })}
            onOpen={() => setEditing(true)}
            onClose={() => setEditing(false)}
          />
        </>
      }
    >
      <Box sx={{ flexGrow: 1, minHeight: 0, minWidth: 0 }}>
        <Heatmap
          {...heatmap}
          colorDomain={range}
          highlightRange={sweep && sweptValues(range, sweep)}
          legendWidth={LEGEND_WIDTH}
          animationType="fade"
          renderLegend={({ width, height, orientation, overlayContainer }) => {
            // An end label, which highlights its clamp or sweeps its end - see ColorbarEnd. Portaled
            // into the expanded minimap when drawn there, or its count would open behind it.
            const endLabel = (end: "low" | "high", position: SVGProps<SVGTextElement>) => (
              <ColorbarEnd
                end={end}
                clamped={clamped[end]}
                range={range}
                values={values}
                noun="cell"
                formatValue={colorbar.formatValue ?? format}
                onSweep={setSweep}
                placement={orientation === "vertical" ? "left" : "top"}
                overlayContainer={overlayContainer}
              >
                <text {...LABEL_TEXT} {...position}>
                  {end === "high"
                    ? `${clamped.high ? "≥ " : ""}${format(high)}`
                    : `${clamped.low ? "≤ " : ""}${format(low)}`}
                </text>
              </ColorbarEnd>
            );
            const graphic = (length: number) => (
              <ColorbarGraphic
                orientation={orientation}
                length={length}
                stops={stops}
                range={range}
                values={values}
                format={format}
                formatValue={colorbar.formatValue}
                noun="cell"
                sweep={sweep}
                onSweep={setSweep}
                overlayContainer={overlayContainer}
              />
            );

            if (orientation === "vertical") {
              const length = Math.max(height - 2 * LABEL_SPACE, 40);
              return (
                <g>
                  {endLabel("high", { x: 0, y: 12 })}
                  <g transform={`translate(0,${LABEL_SPACE})`}>{graphic(length)}</g>
                  {endLabel("low", { x: 0, y: LABEL_SPACE + length + 14 })}
                </g>
              );
            }
            // Across the top of the expanded minimap: the labels either side of the bar, sitting on
            // its bottom edge, as the explorer's colorbar has them.
            const length = Math.max(width - 2 * LEGEND_WIDTH, 40);
            const top = height / 2 - colorbarDepth("horizontal") / 2;
            const barBottom = top + colorbarDepth("horizontal");
            return (
              <g>
                {endLabel("low", { x: LEGEND_WIDTH - 6, y: barBottom, textAnchor: "end" })}
                <g transform={`translate(${LEGEND_WIDTH},${top})`}>{graphic(length)}</g>
                {endLabel("high", { x: LEGEND_WIDTH + length + 6, y: barBottom })}
              </g>
            );
          }}
          tooltipBody={(bin) => tooltipBody(bin, range)}
        />
      </Box>
    </PaneFigure>
  );
};

export default OmeHeatmapShell;
