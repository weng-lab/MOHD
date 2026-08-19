import { WGBSMetadata, SharedWGBSDimenionalityProps } from "./page";
import { ChartProps } from "@weng-lab/visualization";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";

export type WGBSDimensionalityPcaProps<
    S extends boolean | undefined,
    Z extends boolean | undefined
> =
    SharedWGBSDimenionalityProps &
    Partial<ChartProps<WGBSMetadata[number], S, Z>>;

const WGBSPCA = <S extends true, Z extends boolean | undefined>({
    selected,
    WGBSData,
    setSelected,
    ref,
    ...rest
}: WGBSDimensionalityPcaProps<S, Z>) => {
    const { loading, data } = WGBSData;

    return (
        <DimensionalityScatterPlot
            {...rest}
            ref={ref}
            data={data}
            loading={loading}
            selected={selected}
            setSelected={setSelected}
            getX={(row) => row.pca_x}
            getY={(row) => row.pca_y}
            leftAxisLabel="PC-2"
            bottomAxisLabel="PC-1"
            downloadFileName="WGBS_dimesionality_reduction_PCA"
            hasAge
        />
    );
}

export default WGBSPCA;
