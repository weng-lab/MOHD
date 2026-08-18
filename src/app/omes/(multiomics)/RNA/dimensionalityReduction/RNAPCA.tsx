import { RNAMetadata, SharedRNADimenionalityProps } from "./page";
import { ChartProps } from "@weng-lab/visualization";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";

export type RNADimensionalityPcaProps<
    S extends boolean | undefined,
    Z extends boolean | undefined
> =
    SharedRNADimenionalityProps &
    Partial<ChartProps<RNAMetadata[number], S, Z>>;

const RNAPCA = <S extends true, Z extends boolean | undefined>({
    selected,
    RNAData,
    setSelected,
    ref,
    ...rest
}: RNADimensionalityPcaProps<S, Z>) => {
    const { loading, data } = RNAData;

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
            downloadFileName="RNA_dimesionality_reduction_PCA"
        />
    );
}

export default RNAPCA;
