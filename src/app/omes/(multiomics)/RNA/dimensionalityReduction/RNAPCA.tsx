import { useState } from "react";
import { Stack } from "@mui/material";
import { RNAMetadata, SharedRNADimenionalityProps } from "./page";
import { ChartProps } from "@weng-lab/visualization";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";
import { PcAxisSelect, PcField, formatPcLabel } from "@/common/components/PcAxisSelect";

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
    const [xField, setXField] = useState<PcField>("pc1");
    const [yField, setYField] = useState<PcField>("pc2");

    return (
        <DimensionalityScatterPlot
            {...rest}
            ref={ref}
            data={data}
            loading={loading}
            selected={selected}
            setSelected={setSelected}
            getX={(row) => row[xField]}
            getY={(row) => row[yField]}
            leftAxisLabel={formatPcLabel(yField)}
            bottomAxisLabel={formatPcLabel(xField)}
            downloadFileName="RNA_dimesionality_reduction_PCA"
            axisSelectors={
                <Stack direction="row" gap={1}>
                    <PcAxisSelect label="X Axis" value={xField} onChange={setXField} disabledValue={yField} />
                    <PcAxisSelect label="Y Axis" value={yField} onChange={setYField} disabledValue={xField} />
                </Stack>
            }
        />
    );
}

export default RNAPCA;
