import { ATACMetadata, SharedATACDimenionalityProps } from "./page";
import { Point, ScatterPlot, ChartProps } from "@weng-lab/visualization";
import { useMemo, useState } from "react";
import { sex_color_map, status_color_map, site_color_map, protocol_color_map } from "@/common/colors";
import { Typography, Stack, SelectChangeEvent, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorBySelect } from "@/common/components/ColorBySelect";
import UMAPLegend from "@/common/components/UMAPLegend";

export type ATACDimensionalityUmapProps<
    S extends boolean | undefined,
    Z extends boolean | undefined
> =
    SharedATACDimenionalityProps &
    Partial<ChartProps<ATACMetadata[number], S, Z>>;

const map = {
    position: {
        right: 50,
        bottom: 50,
    },
};

const ATACUMAP = <S extends true, Z extends boolean | undefined>({
    selected,
    ATACData,
    setSelected,
    ref,
    ...rest
}: ATACDimensionalityUmapProps<S, Z>) => {
    const [colorScheme, setColorScheme] = useState<"sex" | "status" | "site" | "protocol">("status");
    const theme = useTheme();

    const { loading, data } = ATACData;

    const handleColorSchemeChange = (event: SelectChangeEvent) => {
        setColorScheme(event.target.value as "sex" | "status" | "site" | "protocol");
    };

    const scatterData: Point<ATACMetadata[number]>[] = useMemo(() => {
        if (!data) return [];

        const isHighlighted = (x: ATACMetadata[number]) => selected.some((y) => y.sample_id === x.sample_id);

        return data.map((x) => {

            const getColor = () => {
                if (isHighlighted(x) || selected.length === 0) {
                    if (colorScheme === "sex") {
                        return sex_color_map[x.sex as keyof typeof sex_color_map];
                    } else if (colorScheme === "status") {
                        return status_color_map[x.status as keyof typeof status_color_map];
                    } else if (colorScheme === "site") {
                        return site_color_map[x.site as keyof typeof site_color_map];
                    } else if (colorScheme === "protocol") {
                        return protocol_color_map[x.protocol as keyof typeof protocol_color_map];
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
        selectedPoints: Point<ATACMetadata[number]>[]
    ) => {
        setSelected([
            ...selected,
            ...selectedPoints
                .map((point) => point.metaData)
                .filter(Boolean) as ATACMetadata[number][],
        ]);
    };

    const handlePointSelected = (
        selectedPoint: Point<ATACMetadata[number]>
    ) => {
        if (!selectedPoint.metaData) return;

        const id = selectedPoint.metaData.sample_id;

        if (selected.some((x) => x.sample_id === id)) {
            setSelected(selected.filter((x) => x.sample_id !== id));
        } else {
            setSelected([...selected, selectedPoint.metaData]);
        }
    };

    const TooltipBody = (point: Point<ATACMetadata[number]>) => {
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
                    <b>Sex:</b> {point.metaData?.sex}
                </Typography>
                <Typography>
                    <b>Protocol:</b> {point.metaData?.protocol}
                </Typography>
                <Typography>
                    <b>Kit:</b> {point.metaData?.opc_id}
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
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <ColorBySelect colorScheme={colorScheme} handleColorSchemeChange={handleColorSchemeChange} />
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
                                pointData={scatterData}
                                selectable
                                loading={loading}
                                miniMap={map}
                                // groupPointsAnchor="accession"
                                tooltipBody={(point) => <TooltipBody {...point} />}
                                leftAxisLabel="UMAP-2"
                                bottomAxisLabel="UMAP-1"
                                ref={ref}
                                downloadFileName={`ATAC_dimesionality_reduction_UMAP`}
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

export default ATACUMAP;