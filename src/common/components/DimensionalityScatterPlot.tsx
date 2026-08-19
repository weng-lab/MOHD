import { Point, ScatterPlot, ChartProps, DownloadPlotHandle } from "@weng-lab/visualization";
import { useMemo, useState } from "react";
import { sex_color_map, status_color_map, site_color_map, protocol_color_map } from "@/common/colors";
import { getAgeBin, age_bin_color_map } from "@/common/ageBins";
import { Typography, Stack, SelectChangeEvent, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorBySelect } from "@/common/components/ColorBySelect";
import UMAPLegend from "@/common/components/UMAPLegend";

export type DimensionalityReductionMeta = {
    sample_id: string;
    sex: string;
    status: string;
    site: string;
    protocol?: string;
    /** Sensitive - only ever surface this as a bin via getAgeBin(), never the raw value. */
    age_at_enrollment?: number | null;
};

export type DimensionalityScatterPlotProps<
    T extends DimensionalityReductionMeta,
    S extends boolean | undefined,
    Z extends boolean | undefined
> = {
    data: T[] | undefined;
    loading: boolean;
    selected: T[];
    setSelected: React.Dispatch<React.SetStateAction<T[]>>;
    getX: (row: T) => number | null | undefined;
    getY: (row: T) => number | null | undefined;
    leftAxisLabel: string;
    bottomAxisLabel: string;
    downloadFileName: string;
    hasProtocol?: boolean;
    hasAge?: boolean;
    ref?: React.Ref<DownloadPlotHandle>;
} & Partial<ChartProps<T, S, Z>>;

const map = {
    position: {
        right: 50,
        bottom: 50,
    },
};

const DimensionalityScatterPlot = <
    T extends DimensionalityReductionMeta,
    S extends true,
    Z extends boolean | undefined
>({
    data,
    loading,
    selected,
    setSelected,
    getX,
    getY,
    leftAxisLabel,
    bottomAxisLabel,
    downloadFileName,
    hasProtocol = false,
    hasAge = false,
    ref,
    ...rest
}: DimensionalityScatterPlotProps<T, S, Z>) => {
    const [colorScheme, setColorScheme] = useState<"sex" | "status" | "site" | "protocol" | "age">("site");
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("md"));

    const handleColorSchemeChange = (event: SelectChangeEvent) => {
        setColorScheme(event.target.value as "sex" | "status" | "site" | "protocol" | "age");
    };

    const scatterData: Point<T>[] = useMemo(() => {
        if (!data) return [];

        const isHighlighted = (x: T) => selected.some((y) => y.sample_id === x.sample_id);

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
                    } else if (colorScheme === "age") {
                        return age_bin_color_map[getAgeBin(x.age_at_enrollment)];
                    }
                } else return "#CCCCCC";
            };

            return {
                x: getX(x) ?? 0,
                y: getY(x) ?? 0,
                r: isHighlighted(x) ? 6 : 4,
                color: getColor(),
                metaData: x,
            };
        });
    }, [data, selected, colorScheme, getX, getY]);

    const handlePointsSelected = (
        selectedPoints: Point<T>[]
    ) => {
        setSelected([
            ...selected,
            ...selectedPoints
                .map((point) => point.metaData)
                .filter(Boolean) as T[],
        ]);
    };

    const handlePointSelected = (
        selectedPoint: Point<T>
    ) => {
        if (!selectedPoint.metaData) return;

        const id = selectedPoint.metaData.sample_id;

        if (selected.some((x) => x.sample_id === id)) {
            setSelected(selected.filter((x) => x.sample_id !== id));
        } else {
            setSelected([...selected, selectedPoint.metaData]);
        }
    };

    const TooltipBody = (point: Point<T>) => {
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
                {hasProtocol && (
                    <Typography>
                        <b>Protocol:</b> {point.metaData?.protocol?.replaceAll(" method", "")}
                    </Typography>
                )}
            </>
        );
    };

    return (
        <Stack
            width={"100%"}
            height={"100%"}
        >
            {scatterData &&
                scatterData.length > 0 && (
                    <>
                        <Stack direction={{xs: "column", md: "row"}} justifyContent={{xs: "center", md: "space-between"}} alignItems="center" gap={{xs: 1, md: 0}}>
                            <ColorBySelect
                                colorScheme={colorScheme}
                                handleColorSchemeChange={handleColorSchemeChange}
                                protocol={hasProtocol}
                                age={hasAge}
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
                                controlsPosition={isXs ? "right" : "left"}
                                pointData={scatterData}
                                selectable
                                loading={loading}
                                miniMap={map}
                                tooltipBody={(point) => <TooltipBody {...point} />}
                                leftAxisLabel={leftAxisLabel}
                                bottomAxisLabel={bottomAxisLabel}
                                ref={ref}
                                downloadFileName={downloadFileName}
                                animation="scale"
                                animationBuffer={0.025}
                                animationGroupSize={50}
                            />
                        </Box>
                    </>
                )}
        </Stack>
    );
}

export default DimensionalityScatterPlot;
