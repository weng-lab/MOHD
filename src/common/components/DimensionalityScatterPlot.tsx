import { Point, ScatterPlot, ChartProps, DownloadPlotHandle } from "@weng-lab/visualization";
import { useState } from "react";
import { MISSING_LABEL, getCategoricalLabel, getCategoricalColor } from "@/common/colors";
import { age_bin_color_map, AGE_UNKNOWN_LABEL } from "@/common/ageBins";
import { Typography, Stack, SelectChangeEvent, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ColorBySelect } from "@/common/components/ColorBySelect";
import UMAPLegend from "@/common/components/UMAPLegend";

export type DimensionalityReductionMeta = {
  sample_id: string;
  sex: string;
  status: string;
  site: string;
  protocol?: string;
  /** Binned by the API - raw age is never returned to the client. */
  age_bin?: string | null;
};

export type DimensionalityScatterPlotProps<
  T extends DimensionalityReductionMeta,
  S extends boolean | undefined,
  Z extends boolean | undefined,
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
  axisSelectors?: React.ReactNode;
  ref?: React.Ref<DownloadPlotHandle>;
} & Partial<ChartProps<T, S, Z>>;

const map = {
  position: {
    right: 50,
    bottom: 50,
  },
};

const TooltipBody = ({
  point,
  hasProtocol,
  hasAge,
}: {
  point: Point<DimensionalityReductionMeta>;
  hasProtocol: boolean;
  hasAge: boolean;
}) => {
  return (
    <>
      <Typography>
        <b>Dataset:</b> {point.metaData?.sample_id}
      </Typography>
      <Typography>
        <b>Status:</b> {getCategoricalLabel("status", point.metaData?.status)}
      </Typography>
      <Typography>
        <b>Site:</b> {getCategoricalLabel("site", point.metaData?.site)}
      </Typography>
      <Typography>
        <b>Sex:</b>{" "}
        {point.metaData?.sex ? point.metaData.sex.charAt(0).toUpperCase() + point.metaData.sex.slice(1) : MISSING_LABEL}
      </Typography>
      {hasProtocol && (
        <Typography>
          <b>Protocol:</b> {getCategoricalLabel("protocol", point.metaData?.protocol).replaceAll(" method", "")}
        </Typography>
      )}
      {hasAge && (
        <Typography>
          <b>Age:</b> {point.metaData?.age_bin ?? MISSING_LABEL}
        </Typography>
      )}
    </>
  );
};

const DimensionalityScatterPlot = <
  T extends DimensionalityReductionMeta,
  S extends true,
  Z extends boolean | undefined,
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
  axisSelectors,
  ref,
  ...rest
}: DimensionalityScatterPlotProps<T, S, Z>) => {
  const [colorScheme, setColorScheme] = useState<"sex" | "status" | "site" | "protocol" | "age">("site");
  const theme = useTheme();

  const handleColorSchemeChange = (event: SelectChangeEvent) => {
    setColorScheme(event.target.value as "sex" | "status" | "site" | "protocol" | "age");
  };

  const selectedIds = new Set(selected.map((y) => y.sample_id));
  const isHighlighted = (x: T) => selectedIds.has(x.sample_id);

  const scatterData: Point<T>[] = !data
    ? []
    : data.map((x) => {
        const highlighted = isHighlighted(x);

        const getColor = () => {
          if (highlighted || selected.length === 0) {
            if (colorScheme === "sex") {
              return getCategoricalColor("sex", getCategoricalLabel("sex", x.sex));
            } else if (colorScheme === "status") {
              return getCategoricalColor("status", getCategoricalLabel("status", x.status));
            } else if (colorScheme === "site") {
              return getCategoricalColor("site", getCategoricalLabel("site", x.site));
            } else if (colorScheme === "protocol") {
              return getCategoricalColor("protocol", getCategoricalLabel("protocol", x.protocol));
            } else if (colorScheme === "age") {
              return age_bin_color_map[x.age_bin ?? AGE_UNKNOWN_LABEL];
            }
          } else return "#CCCCCC";
        };

        return {
          x: getX(x) ?? 0,
          y: getY(x) ?? 0,
          r: highlighted ? 6 : 4,
          color: getColor(),
          metaData: x,
        };
      });

  const handlePointsSelected = (selectedPoints: Point<T>[]) => {
    const newlySelected: T[] = [];
    for (const point of selectedPoints) {
      if (point.metaData) newlySelected.push(point.metaData);
    }
    setSelected([...selected, ...newlySelected]);
  };

  const handlePointSelected = (selectedPoint: Point<T>) => {
    if (!selectedPoint.metaData) return;

    const id = selectedPoint.metaData.sample_id;

    if (selected.some((x) => x.sample_id === id)) {
      setSelected(selected.filter((x) => x.sample_id !== id));
    } else {
      setSelected([...selected, selectedPoint.metaData]);
    }
  };

  return (
    <Stack width={"100%"} height={"100%"}>
      {scatterData && scatterData.length > 0 && (
        <>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent={{ xs: "center", md: "space-between" }}
            alignItems="center"
            columnGap={{ xs: 1, md: 0 }}
            rowGap={1}
            flexWrap="wrap"
            mb={1}
          >
            <Stack direction={"row"} alignItems="center" gap={1} flexWrap="wrap">
              <ColorBySelect
                colorScheme={colorScheme}
                handleColorSchemeChange={handleColorSchemeChange}
                protocol={hasProtocol}
                age={hasAge}
              />
              {axisSelectors}
            </Stack>
            <UMAPLegend colorScheme={colorScheme} scatterData={scatterData} />
          </Stack>
          <Box sx={{ flexGrow: 1 }}>
            <ScatterPlot
              {...rest}
              onSelectionChange={handlePointsSelected}
              onPointClicked={handlePointSelected}
              controlsHighlight={theme.palette.primary.main}
              controlsPosition={"right"}
              pointData={scatterData}
              selectable
              loading={loading}
              miniMap={map}
              tooltipBody={(point) => <TooltipBody point={point} hasProtocol={hasProtocol} hasAge={hasAge} />}
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
};

export default DimensionalityScatterPlot;
