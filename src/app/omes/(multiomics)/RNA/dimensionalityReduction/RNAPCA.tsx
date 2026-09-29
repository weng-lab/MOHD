import { useState } from "react";
import { Stack } from "@mui/material";
import { SharedRNADimenionalityProps } from "./page";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";
import { PcAxisSelect } from "@/common/components/PcAxisSelect";
import { PcField, formatPcLabel } from "@/common/components/pcAxis";
import { usePcaVariance } from "@/common/hooks/omeHooks/usePcaVariance";
import { PcaOme } from "@/common/types/generated/graphql";

const RNAPCA = ({ RNAData, sampleTable, ref }: SharedRNADimenionalityProps) => {
  const { loading } = RNAData;
  const [xField, setXField] = useState<PcField>("pc1");
  const [yField, setYField] = useState<PcField>("pc2");
  const { pve } = usePcaVariance(PcaOme.Rna);

  return (
    <DimensionalityScatterPlot
      table={sampleTable}
      ref={ref}
      loading={loading}
      getX={(row) => row[xField]}
      getY={(row) => row[yField]}
      leftAxisLabel={formatPcLabel(yField, pve)}
      bottomAxisLabel={formatPcLabel(xField, pve)}
      downloadFileName="RNA_dimesionality_reduction_PCA"
      axisSelectors={
        <Stack direction="row" gap={1}>
          <PcAxisSelect label="X Axis" value={xField} onChange={setXField} disabledValue={yField} pve={pve} />
          <PcAxisSelect label="Y Axis" value={yField} onChange={setYField} disabledValue={xField} pve={pve} />
        </Stack>
      }
    />
  );
};

export default RNAPCA;
