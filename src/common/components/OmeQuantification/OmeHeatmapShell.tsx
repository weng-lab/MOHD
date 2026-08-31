import { Heatmap, ColumnDatum, HeatmapProps, DownloadPlotHandle } from "@weng-lab/visualization";
import { Stack, Box, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useHeatmapCellSelection, CellSelectionSample } from "./useHeatmapCellSelection";

export type OmeHeatmapShellProps<TSample extends CellSelectionSample> = {
    loading: boolean;
    samples: TSample[];
    heatmapData: ColumnDatum<TSample, Record<string, unknown>>[];
    selected: TSample[];
    setSelected: React.Dispatch<React.SetStateAction<TSample[]>>;
    autoSort: boolean;
    yLabel: string;
    downloadFileName: string;
    tooltipBody: HeatmapProps["tooltipBody"];
    ref?: React.RefObject<DownloadPlotHandle | null>;
    emptyMessage?: string;
};

const OmeHeatmapShell = <TSample extends CellSelectionSample>({
    loading,
    samples,
    heatmapData,
    selected,
    setSelected,
    autoSort,
    yLabel,
    downloadFileName,
    tooltipBody,
    ref,
    emptyMessage = "No samples match the current table filters.",
}: OmeHeatmapShellProps<TSample>) => {
    const theme = useTheme();
    const heatmapColors: [string, string, string, string] = [
        theme.palette.primary.main,
        theme.palette.primary.light,
        theme.palette.secondary.light,
        theme.palette.secondary.main,
    ];

    const { selectedCells, handleCellClick } = useHeatmapCellSelection(heatmapData, samples, selected, setSelected);

    if (loading) {
        return (
            <Stack width="100%" height="100%" alignItems="center" justifyContent="center">
                <CircularProgress />
            </Stack>
        );
    }

    return (
        <Stack width="100%" height="100%">
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                {heatmapData.length === 0 ? (
                    <Stack width="100%" height="100%" alignItems="center" justifyContent="center">
                        <Typography color="text.secondary">{emptyMessage}</Typography>
                    </Stack>
                ) : (
                    <Heatmap
                        ref={ref}
                        data={heatmapData}
                        colors={heatmapColors}
                        xLabel="Sample"
                        yLabel={yLabel}
                        showLegend
                        downloadFileName={downloadFileName}
                        selectedCells={selectedCells}
                        onClick={(bin) => handleCellClick(bin.datum.columnName)}
                        cellWidth={25}
                        cellHeight={20}
                        xLabelOrientation="leftDiagonal"
                        showMiniMap
                        scrollToSelection={!autoSort}
                        tooltipBody={tooltipBody}
                    />
                )}
            </Box>
        </Stack>
    );
};

export default OmeHeatmapShell;
