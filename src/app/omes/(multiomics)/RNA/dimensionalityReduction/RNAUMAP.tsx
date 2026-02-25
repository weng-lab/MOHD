import { RNAMetadata, SharedRNADimenionalityProps } from "./page";
import { Point, ScatterPlot, ChartProps } from "@weng-lab/visualization";
import { useMemo, useState } from "react";
import { sex_color_map, status_color_map, site_color_map } from "@/common/colors";
import { Typography, Stack, SelectChangeEvent, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorBySelect } from "@/common/components/ColorBySelect";
import UMAPLegend from "@/common/components/UMAPLegend";

export type RNADimensionalityUmapProps<
    S extends boolean | undefined,
    Z extends boolean | undefined
> =
    SharedRNADimenionalityProps &
    Partial<ChartProps<RNAMetadata[number], S, Z>>;

const map = {
    position: {
        right: 50,
        bottom: 50,
    },
};

const RNAUMAP = <S extends true, Z extends boolean | undefined>({
    selected,
    RNAData,
    setSelected,
    ref,
    ...rest
}: RNADimensionalityUmapProps<S, Z>) => {
    const [colorScheme, setColorScheme] = useState<"sex" | "status" | "site">("site");
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));

    const { loading, data } = RNAData;

    const handleColorSchemeChange = (event: SelectChangeEvent) => {
        setColorScheme(event.target.value as "sex" | "status" | "site");
    };

    const scatterData: Point<RNAMetadata[number]>[] = useMemo(() => {
        if (!data) return [];

        const isHighlighted = (x: RNAMetadata[number]) => selected.some((y) => y.sample_id === x.sample_id);

        return data.map((x) => {

            const getColor = () => {
                if (isHighlighted(x) || selected.length === 0) {
                    if (colorScheme === "sex") {
                        return sex_color_map[x.sex as keyof typeof sex_color_map];
                    } else if (colorScheme === "status") {
                        return status_color_map[x.status as keyof typeof status_color_map];
                    } else if (colorScheme === "site") {
                        return site_color_map[x.site as keyof typeof site_color_map];
                    }
                } else return "#CCCCCC";
            };

            return {
                x: x.umap_x ?? 0,
                y: x.umap_y ?? 0,
                r: isHighlighted(x) ? 6 : 4,
                color: getColor(),
                metaData: x,
            };
        });
    }, [data, selected, colorScheme]);

    const handlePointsSelected = (
        selectedPoints: Point<RNAMetadata[number]>[]
    ) => {
        setSelected([
            ...selected,
            ...selectedPoints
                .map((point) => point.metaData)
                .filter(Boolean) as RNAMetadata[number][],
        ]);
    };

    const handlePointSelected = (
        selectedPoint: Point<RNAMetadata[number]>
    ) => {
        if (!selectedPoint.metaData) return;

        const id = selectedPoint.metaData.sample_id;

        if (selected.some((x) => x.sample_id === id)) {
            setSelected(selected.filter((x) => x.sample_id !== id));
        } else {
            setSelected([...selected, selectedPoint.metaData]);
        }
    };

    const TooltipBody = (point: Point<RNAMetadata[number]>) => {
        return (
            <>
                <Typography>
                    <b>Dataset:</b> {point.metaData?.sample_id}
                </Typography>
                <Typography>
                    <b>Status:</b> {point.metaData?.status}
                </Typography>
                <Typography>
                    <b>Site:</b> {point.metaData?.site}
                </Typography>
                <Typography>
                    <b>Sex:</b> {point.metaData?.sex ? point.metaData.sex.charAt(0).toUpperCase() + point.metaData.sex.slice(1) : ''}
                </Typography>
            </>
        );
    };

    return (
        <Stack
            width={"100%"}
            height={"100%"}
            padding={1}
            sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, position: "relative" }}
        >
            {scatterData &&
                scatterData.length > 0 && (
                    <>
                        <Stack direction={{xs: "column", md: "row"}} justifyContent="space-between" alignItems="center">
                            <ColorBySelect 
                                colorScheme={colorScheme} 
                                handleColorSchemeChange={handleColorSchemeChange}
                                protocol={false} 
                            />
                            <UMAPLegend
                                colorScheme={colorScheme}
                                scatterData={scatterData}
                            />
                        </Stack>
                        <Box sx={{ flexGrow: 1 }}>
                            <ScatterPlot
                                {...rest}
                                onSelectionChange={handlePointsSelected}
                                onPointClicked={handlePointSelected}
                                controlsHighlight={theme.palette.primary.main}
                                controlsPosition={isXs ? "bottom" : "left"}
                                pointData={scatterData}
                                selectable
                                loading={loading}
                                miniMap={map}
                                tooltipBody={(point) => <TooltipBody {...point} />}
                                leftAxisLabel="UMAP-2"
                                bottomAxisLabel="UMAP-1"
                                ref={ref}
                                downloadFileName={`RNA_dimesionality_reduction_UMAP`}
                                animation="scale"
                                animationBuffer={0.025}
                                animationGroupSize={5}
                            />
                        </Box>
                    </>
                )}
        </Stack>
    );
}

export default RNAUMAP;