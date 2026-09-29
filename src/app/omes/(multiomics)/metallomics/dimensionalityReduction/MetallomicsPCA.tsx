import { useState } from "react";
import { Stack } from "@mui/material";
import { SharedMetallomicsDimenionalityProps } from "./page";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";
import { PcAxisSelect } from "@/common/components/PcAxisSelect";
import { PcField, formatPcLabel } from "@/common/components/pcAxis";
import { usePcaVariance } from "@/common/hooks/omeHooks/usePcaVariance";
import { PcaOme } from "@/common/types/generated/graphql";

const MetallomicsPCA = ({ metallomicsMetadata, sampleTable, ref }: SharedMetallomicsDimenionalityProps) => {
  const { loading } = metallomicsMetadata;
  const [xField, setXField] = useState<PcField>("pc1");
  const [yField, setYField] = useState<PcField>("pc2");
  const { pve } = usePcaVariance(PcaOme.Metallomics);

  return (
    <DimensionalityScatterPlot
      table={sampleTable}
      ref={ref}
      loading={loading}
      getX={(row) => row[xField]}
      getY={(row) => row[yField]}
      leftAxisLabel={formatPcLabel(yField, pve)}
      bottomAxisLabel={formatPcLabel(xField, pve)}
      downloadFileName="metallomics_dimensionality_reduction_PCA"
      axisSelectors={
        <Stack direction="row" gap={1}>
          <PcAxisSelect label="X Axis" value={xField} onChange={setXField} disabledValue={yField} pve={pve} />
          <PcAxisSelect label="Y Axis" value={yField} onChange={setYField} disabledValue={xField} pve={pve} />
        </Stack>
      }
    />
  );
};

export default MetallomicsPCA;
