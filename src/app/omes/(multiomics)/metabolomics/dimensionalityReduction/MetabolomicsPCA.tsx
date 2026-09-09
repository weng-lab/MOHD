import { useState } from "react";
import { Stack } from "@mui/material";
import { MetabolomicsDimenionalityMetadata, SharedMetabolomicsDimenionalityProps } from "./page";
import { ChartProps } from "@weng-lab/visualization";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";
import { PcAxisSelect } from "@/common/components/PcAxisSelect";
import { PcField, formatPcLabel } from "@/common/components/pcAxis";

export type MetabolomicsDimensionalityPcaProps<
  S extends boolean | undefined,
  Z extends boolean | undefined,
> = SharedMetabolomicsDimenionalityProps & Partial<ChartProps<MetabolomicsDimenionalityMetadata[number], S, Z>>;

const MetabolomicsPCA = <S extends true, Z extends boolean | undefined>({
  selected,
  metabolomicsMetadata,
  setSelected,
  ref,
  ...rest
}: MetabolomicsDimensionalityPcaProps<S, Z>) => {
  const { loading, data } = metabolomicsMetadata;
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
      downloadFileName="metabolomics_dimensionality_reduction_PCA"
      hasProtocol
      hasAge
      axisSelectors={
        <Stack direction="row" gap={1}>
          <PcAxisSelect label="X Axis" value={xField} onChange={setXField} disabledValue={yField} />
          <PcAxisSelect label="Y Axis" value={yField} onChange={setYField} disabledValue={xField} />
        </Stack>
      }
    />
  );
};

export default MetabolomicsPCA;
