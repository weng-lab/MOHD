"use client";
import { TwoPaneLayout } from "@weng-lab/ui-components";
import { ScatterPlot } from "@mui/icons-material";
import ATACDimensionalityScatterPlot from "./ATACUMAP";
import ATACDimensionalityPCAPlot from "./ATACPCA";
import { DownloadPlotHandle } from "@weng-lab/visualization";

import { useATACData, UseATACDataReturn } from "@/common/hooks/omeHooks/useATACData";
import SampleTable from "@/common/sampleFields/SampleTable";
import { useSampleTable, type SampleTableState } from "@/common/sampleFields/useSampleTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";
import { TWO_PANE_HEIGHTS } from "@/common/components/OmeDetails/omePageHeight";

export type ATACMetadata = NonNullable<UseATACDataReturn["data"]>;

export type SharedATACDimenionalityProps = {
  ATACData: UseATACDataReturn;
  sampleTable: SampleTableState<ATACMetadata[number]>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const ATACDimensionalityReduction = () => {
  const { ref: umapRef, ...umapDownload } = usePlotDownload();
  const { ref: pcaRef, ...pcaDownload } = usePlotDownload();
  const ATACData = useATACData({ skip: false });

  const sampleTable = useSampleTable("ATAC", ATACData.data);

  const SharedATACDimenionalityProps: SharedATACDimenionalityProps = {
    ATACData,
    sampleTable,
  };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      {...TWO_PANE_HEIGHTS}
      TableComponent={
        <SampleTable
          label="ATAC-seq Dimensionality Reduction"
          table={sampleTable}
          loading={ATACData.loading}
          error={ATACData.error}
        />
      }
      plots={[
        {
          tabTitle: "PCA",
          icon: <ScatterPlot />,
          plotComponent: <ATACDimensionalityPCAPlot ref={pcaRef} {...SharedATACDimenionalityProps} />,
          ...pcaDownload,
        },
        {
          tabTitle: "UMAP",
          icon: <ScatterPlot />,
          plotComponent: <ATACDimensionalityScatterPlot ref={umapRef} {...SharedATACDimenionalityProps} />,
          ...umapDownload,
        },
      ]}
    />
  );
};

export default ATACDimensionalityReduction;
