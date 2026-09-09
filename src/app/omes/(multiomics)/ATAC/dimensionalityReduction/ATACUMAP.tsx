import { ATACMetadata, SharedATACDimenionalityProps } from "./page";
import { ChartProps } from "@weng-lab/visualization";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";


export type ATACDimensionalityUmapProps<
  S extends boolean | undefined,
  Z extends boolean | undefined,
> = SharedATACDimenionalityProps & Partial<ChartProps<ATACMetadata[number], S, Z>>;

const ATACUMAP = <S extends true, Z extends boolean | undefined>({
  selected,
  ATACData,
  setSelected,
  ref,
  ...rest
}: ATACDimensionalityUmapProps<S, Z>) => {
    const { loading, data } = ATACData;

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
            downloadFileName="ATAC_dimesionality_reduction_UMAP"
            hasProtocol
        />
    );
}

export default ATACUMAP;
