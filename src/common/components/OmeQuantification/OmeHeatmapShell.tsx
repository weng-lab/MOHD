import { Stack, Box, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { ReactElement } from "react";
import {
  ZoomableHeatmap,
  type ColorRange,
  type DownloadPlotHandle,
  type ZoomableHeatmapCell,
  type ZoomableHeatmapProps,
} from "@weng-lab/visualization";
import { captionLabelStyle } from "../captionLabelStyle";
import PaneFigure from "../PaneFigure";
import { PlotHeaderTitle } from "../PlotHeader";
import { HEATMAP_SCALES, type HeatmapColorbar } from "./heatmapColorScale";
import { useHeatmapCellSelection, CellSelectionSample } from "./useHeatmapCellSelection";

export type OmeHeatmapShellProps<TSample extends CellSelectionSample> = {
  loading: boolean;
  /** The samples the table's filters leave in, as the heatmap's columns. */
  samples: TSample[];
  /** How many samples there are before the table's filters, for the header's count. */
  total: number;
  /** Top to bottom. Long names are cut short to fit, with "…". */
  rowNames: string[];
  /** Every cell's value on the color scale - see heatmapValues. */
  values: Float32Array;
  selected: TSample[];
  setSelected: React.Dispatch<React.SetStateAction<TSample[]>>;
  autoSort: boolean;
  yLabel: string;
  downloadFileName: string;
  /** Given the range the colors span now - so a tooltip can say where a cell beyond it is colored. */
  tooltipBody: (cell: ZoomableHeatmapCell, domain: ColorRange) => ReactElement;
  ref?: React.RefObject<DownloadPlotHandle | null>;
  emptyMessage?: string;
  colorDomain?: ZoomableHeatmapProps["colorDomain"];
  colors: ZoomableHeatmapProps["colors"];
  /** In the header, e.g. a HeatmapScaleToggle. */
  controls?: React.ReactNode;
  /**
   * A colorbar above the grid, which can be swept to pick out a stretch of the scale - the outliers
   * past ±3, say - wherever they are, and has a button beside it to move its range from colorDomain.
   * Without one, there's no legend.
   */
  colorbar?: HeatmapColorbar;
};

const scaleName = ({ mode }: HeatmapColorbar) => {
  const { formula, zScored } = HEATMAP_SCALES[mode];
  return zScored ? `Z-score of ${formula}` : formula;
};

const OmeHeatmapShell = <TSample extends CellSelectionSample>({
  loading,
  samples,
  total,
  rowNames,
  values,
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
  const { selectedColumns, handleCellClick } = useHeatmapCellSelection(samples, selected, setSelected);
  const labelStyle = captionLabelStyle(useTheme());

  if (loading) {
    return (
      <Stack width="100%" height="100%" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  const title = <PlotHeaderTitle title="Samples" shown={samples.length} total={total} />;

  if (samples.length === 0) {
    return (
      <PaneFigure title={title} controls={controls}>
        <Stack flexGrow={1} alignItems="center" justifyContent="center">
          <Typography color="text.secondary">{emptyMessage}</Typography>
        </Stack>
      </PaneFigure>
    );
  }

  return (
    <PaneFigure title={title} controls={controls}>
      <Box sx={{ flexGrow: 1, minHeight: 0, minWidth: 0 }}>
        <ZoomableHeatmap
          ref={ref}
          values={values}
          rowNames={rowNames}
          columnNames={samples.map((sample) => sample.sample_id)}
          colors={colors}
          colorDomain={colorDomain}
          xLabel="Dataset"
          yLabel={yLabel}
          tooltipBody={tooltipBody}
          onCellClick={handleCellClick}
          selectedColumns={selectedColumns}
          scrollToSelection={!autoSort}
          showLegend={!!colorbar}
          legend={
            colorbar && {
              label: scaleName(colorbar),
              kind: colorbar.kind,
              format: colorbar.format,
              formatValue: colorbar.formatValue,
              noun: "cell",
              labelStyle,
              extent: colorbar.extent,
              presets: colorbar.presets,
              notes: colorbar.notes,
            }
          }
          fadeIn
          downloadFileName={downloadFileName}
        />
      </Box>
    </PaneFigure>
  );
};

export default OmeHeatmapShell;
