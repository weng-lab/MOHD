import { SharedWGBSDimenionalityProps } from "./WGBSDimensionalityReductionClient";
import type { WGBSRow } from "./types";
import { ChartProps } from "@weng-lab/visualization";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";

export type WGBSDimensionalityPcaProps<
    S extends boolean | undefined,
    Z extends boolean | undefined
> =
    SharedWGBSDimenionalityProps &
    Partial<ChartProps<WGBSRow, S, Z>>;

const WGBSPCA = <S extends true, Z extends boolean | undefined>({
    rows,
    selected,
    setSelected,
    ref,
    ...rest
}: WGBSDimensionalityPcaProps<S, Z>) => {
    return (
        <DimensionalityScatterPlot
            {...rest}
            ref={ref}
            data={rows}
            loading={false}
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
