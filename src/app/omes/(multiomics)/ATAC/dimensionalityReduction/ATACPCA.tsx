import { useState } from "react";
import { Stack } from "@mui/material";
import { SharedATACDimenionalityProps } from "./page";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";
import { PcAxisSelect } from "@/common/components/PcAxisSelect";
import { PcField, formatPcLabel } from "@/common/components/pcAxis";
import { usePcaVariance } from "@/common/hooks/omeHooks/usePcaVariance";
import { PcaOme } from "@/common/types/generated/graphql";
import type { AtacProtocol } from "@/common/atacProtocols";

type ATACPCAProps = SharedATACDimenionalityProps & {
  /** The protocol whose samples, and whose own PCA, the plot shows. */
  protocol: AtacProtocol;
};

const ATACPCA = ({ ATACData, sampleTable, protocol, ref }: ATACPCAProps) => {
  const { loading } = ATACData;
  const [xField, setXField] = useState<PcField>("pc1");
  const [yField, setYField] = useState<PcField>("pc2");
  const { pve } = usePcaVariance(PcaOme.Atac, protocol.key);

  return (
    <DimensionalityScatterPlot
      table={sampleTable}
      protocol={protocol.value}
      ref={ref}
      loading={loading}
      getX={(row) => row[xField]}
      getY={(row) => row[yField]}
      leftAxisLabel={formatPcLabel(yField, pve)}
      bottomAxisLabel={formatPcLabel(xField, pve)}
      downloadFileName={`ATAC_dimensionality_reduction_PCA_${protocol.key}`}
      axisSelectors={
        <Stack direction="row" gap={1}>
          <PcAxisSelect label="X Axis" value={xField} onChange={setXField} disabledValue={yField} pve={pve} />
          <PcAxisSelect label="Y Axis" value={yField} onChange={setYField} disabledValue={xField} pve={pve} />
        </Stack>
      }
    />
  );
};

export default ATACPCA;
