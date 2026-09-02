import { SharedWGBSDimenionalityProps } from "./WGBSDimensionalityReductionClient";
import type { WGBSRow } from "./types";
import { ChartProps } from "@weng-lab/visualization";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";

export type WGBSDimensionalityUmapProps<
    S extends boolean | undefined,
    Z extends boolean | undefined
> =
    SharedWGBSDimenionalityProps &
    Partial<ChartProps<WGBSRow, S, Z>>;

const WGBSUMAP = <S extends true, Z extends boolean | undefined>({
    rows,
    selected,
    setSelected,
    ref,
    ...rest
}: WGBSDimensionalityUmapProps<S, Z>) => {
    return (
        <DimensionalityScatterPlot
            {...rest}
            ref={ref}
            data={rows}
            loading={false}
            selected={selected}
            setSelected={setSelected}
            getX={(row) => row.umap_x}
            getY={(row) => row.umap_y}
            leftAxisLabel="UMAP-2"
            bottomAxisLabel="UMAP-1"
            downloadFileName="WGBS_dimesionality_reduction_UMAP"
            hasAge
        />
    );
}

export default WGBSUMAP;
