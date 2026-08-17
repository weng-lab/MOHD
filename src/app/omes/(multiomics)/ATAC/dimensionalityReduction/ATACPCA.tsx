import { ATACMetadata, SharedATACDimenionalityProps } from "./page";
import { ChartProps } from "@weng-lab/visualization";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";

export type ATACDimensionalityPcaProps<
    S extends boolean | undefined,
    Z extends boolean | undefined
> =
    SharedATACDimenionalityProps &
    Partial<ChartProps<ATACMetadata[number], S, Z>>;

const ATACPCA = <S extends true, Z extends boolean | undefined>({
    selected,
    ATACData,
    setSelected,
    ref,
    ...rest
}: ATACDimensionalityPcaProps<S, Z>) => {
    const { loading, data } = ATACData;

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
            leftAxisLabel="PCA-2"
            bottomAxisLabel="PCA-1"
            downloadFileName="ATAC_dimesionality_reduction_PCA"
            hasProtocol
        />
    );
}

export default ATACPCA;
