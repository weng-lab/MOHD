"use client";
import { TwoPaneLayout } from "@weng-lab/ui-components";
import { ScatterPlot } from "@mui/icons-material";
import MetabolomicsPCA from "./MetabolomicsPCA";
import { DownloadPlotHandle } from "@weng-lab/visualization";

import {
  useMetabolomicsDimensionalityReduction,
  UseMetabolomicsDimensionalityReductionReturn,
} from "@/common/hooks/omeHooks/useMetabolomicsDimensionalityReduction";
import SampleTable from "@/common/sampleFields/SampleTable";
import { useSampleTable, type SampleTableState } from "@/common/sampleFields/useSampleTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";
import { TWO_PANE_HEIGHTS } from "@/common/components/OmeDetails/omePageHeight";

export type MetabolomicsDimenionalityMetadata = NonNullable<UseMetabolomicsDimensionalityReductionReturn["data"]>;

export type SharedMetabolomicsDimenionalityProps = {
  metabolomicsMetadata: UseMetabolomicsDimensionalityReductionReturn;
  sampleTable: SampleTableState<MetabolomicsDimenionalityMetadata[number]>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const MetabolomicsDimensionalityReduction = () => {
  const { ref: pcaRef, ...pcaDownload } = usePlotDownload();
  const metabolomicsMetadata = useMetabolomicsDimensionalityReduction({ skip: false });

  const sampleTable = useSampleTable("metabolomics", metabolomicsMetadata.data);

  const SharedMetabolomicsDimenionalityProps: SharedMetabolomicsDimenionalityProps = {
    metabolomicsMetadata,
    sampleTable,
  };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      {...TWO_PANE_HEIGHTS}
      TableComponent={
        <SampleTable
          label="Metabolomics Dimensionality Reduction"
          table={sampleTable}
          loading={metabolomicsMetadata.loading}
          error={metabolomicsMetadata.error}
        />
      }
      plots={[
        {
          tabTitle: "PCA",
          icon: <ScatterPlot />,
          plotComponent: <MetabolomicsPCA ref={pcaRef} {...SharedMetabolomicsDimenionalityProps} />,
          ...pcaDownload,
        },
      ]}
    />
  );
};

export default MetabolomicsDimensionalityReduction;
