import { WGBSMetadata, SharedWGBSDimenionalityProps } from "./page";
import { ChartProps } from "@weng-lab/visualization";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";

export type WGBSDimensionalityUmapProps<
    S extends boolean | undefined,
    Z extends boolean | undefined
> =
    SharedWGBSDimenionalityProps &
    Partial<ChartProps<WGBSMetadata[number], S, Z>>;

const WGBSUMAP = <S extends true, Z extends boolean | undefined>({
    selected,
    WGBSData,
    setSelected,
    ref,
    ...rest
}: WGBSDimensionalityUmapProps<S, Z>) => {
    const { loading, data } = WGBSData;

    return (
        <DimensionalityScatterPlot
            {...rest}
            ref={ref}
            data={data}
            loading={loading}
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
