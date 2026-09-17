import { useState } from "react";
import { Stack } from "@mui/material";
import { WGBSMetadata, SharedWGBSDimenionalityProps } from "./page";
import { ChartProps } from "@weng-lab/visualization";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";
import { PcAxisSelect } from "@/common/components/PcAxisSelect";
import { PcField, formatPcLabel } from "@/common/components/pcAxis";
import { usePcaVariance } from "@/common/hooks/omeHooks/usePcaVariance";
import { PcaOme } from "@/common/types/generated/graphql";

export type WGBSDimensionalityPcaProps<
  S extends boolean | undefined,
  Z extends boolean | undefined,
> = SharedWGBSDimenionalityProps & Partial<ChartProps<WGBSMetadata[number], S, Z>>;

const WGBSPCA = <S extends true, Z extends boolean | undefined>({
  rows,
  WGBSData,
  selected,
  setSelected,
  ref,
  ...rest
}: WGBSDimensionalityPcaProps<S, Z>) => {
  const { loading } = WGBSData;
  const [xField, setXField] = useState<PcField>("pc1");
  const [yField, setYField] = useState<PcField>("pc2");
  const { pve } = usePcaVariance(PcaOme.Wgbs);

  return (
    <DimensionalityScatterPlot
      {...rest}
      ref={ref}
      data={rows}
      loading={loading}
      selected={selected}
      setSelected={setSelected}
      getX={(row) => row[xField]}
      getY={(row) => row[yField]}
      leftAxisLabel={formatPcLabel(yField, pve)}
      bottomAxisLabel={formatPcLabel(xField, pve)}
      downloadFileName="WGBS_dimesionality_reduction_PCA"
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

export default WGBSPCA;
