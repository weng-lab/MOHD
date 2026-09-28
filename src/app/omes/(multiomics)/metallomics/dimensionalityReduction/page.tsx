"use client";
import { TwoPaneLayout } from "@weng-lab/ui-components";
import { ScatterPlot } from "@mui/icons-material";
import MetallomicsPCA from "./MetallomicsPCA";
import { DownloadPlotHandle } from "@weng-lab/visualization";

import {
  useMetallomicsDimensionalityReduction,
  UseMetallomicsDimensionalityReductionReturn,
} from "@/common/hooks/omeHooks/useMetallomicsDimensionalityReduction";
import SampleTable from "@/common/sampleFields/SampleTable";
import { useSampleTable, type SampleTableState } from "@/common/sampleFields/useSampleTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type MetallomicsDimenionalityMetadata = NonNullable<UseMetallomicsDimensionalityReductionReturn["data"]>;

export type SharedMetallomicsDimenionalityProps = {
  metallomicsMetadata: UseMetallomicsDimensionalityReductionReturn;
  sampleTable: SampleTableState<MetallomicsDimenionalityMetadata[number]>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const MetallomicsDimensionalityReduction = () => {
  const { ref: pcaRef, ...pcaDownload } = usePlotDownload();
  const metallomicsMetadata = useMetallomicsDimensionalityReduction({ skip: false });

  const sampleTable = useSampleTable("metallomics", metallomicsMetadata.data);

  const SharedMetallomicsDimenionalityProps: SharedMetallomicsDimenionalityProps = {
    metallomicsMetadata,
    sampleTable,
  };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      rowHeight="max(60vh, 700px)"
      TableComponent={
        <SampleTable
          label="Metallomics Dimensionality Reduction"
          table={sampleTable}
          loading={metallomicsMetadata.loading}
          error={metallomicsMetadata.error}
        />
      }
      plots={[
        {
          tabTitle: "PCA",
          icon: <ScatterPlot />,
          plotComponent: <MetallomicsPCA ref={pcaRef} {...SharedMetallomicsDimenionalityProps} />,
          ...pcaDownload,
        },
      ]}
    />
  );
};

export default MetallomicsDimensionalityReduction;
