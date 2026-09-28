import { useState } from "react";
import { Stack } from "@mui/material";
import { MetallomicsDimenionalityMetadata, SharedMetallomicsDimenionalityProps } from "./page";
import { ChartProps } from "@weng-lab/visualization";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";
import { PcAxisSelect } from "@/common/components/PcAxisSelect";
import { PcField, formatPcLabel } from "@/common/components/pcAxis";
import { usePcaVariance } from "@/common/hooks/omeHooks/usePcaVariance";
import { PcaOme } from "@/common/types/generated/graphql";

export type MetallomicsDimensionalityPcaProps<
  S extends boolean | undefined,
  Z extends boolean | undefined,
> = SharedMetallomicsDimenionalityProps & Partial<ChartProps<MetallomicsDimenionalityMetadata[number], S, Z>>;

const MetallomicsPCA = <S extends true, Z extends boolean | undefined>({
  selected,
  metallomicsMetadata,
  setSelected,
  ref,
  ...rest
}: MetallomicsDimensionalityPcaProps<S, Z>) => {
  const { loading, data } = metallomicsMetadata;
  const [xField, setXField] = useState<PcField>("pc1");
  const [yField, setYField] = useState<PcField>("pc2");
  const { pve } = usePcaVariance(PcaOme.Metallomics);

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
      leftAxisLabel={formatPcLabel(yField, pve)}
      bottomAxisLabel={formatPcLabel(xField, pve)}
      downloadFileName="metallomics_dimensionality_reduction_PCA"
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

export default MetallomicsPCA;
