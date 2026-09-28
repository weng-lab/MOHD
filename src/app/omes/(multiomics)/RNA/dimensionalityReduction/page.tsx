"use client";
import { TwoPaneLayout } from "@weng-lab/ui-components";
import { ScatterPlot } from "@mui/icons-material";
import { DownloadPlotHandle } from "@weng-lab/visualization";
import { useRNAData, UseRNADataReturn } from "@/common/hooks/omeHooks/useRNAData";
import RNADimensionalityScatterPlot from "./RNAUMAP";
import RNADimensionalityPCAPlot from "./RNAPCA";

import SampleTable from "@/common/sampleFields/SampleTable";
import { useSampleTable, type SampleTableState } from "@/common/sampleFields/useSampleTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";
import { TWO_PANE_HEIGHTS } from "@/common/components/OmeDetails/omePageHeight";

export type RNAMetadata = NonNullable<UseRNADataReturn["data"]>;

export type SharedRNADimenionalityProps = {
  RNAData: UseRNADataReturn;
  sampleTable: SampleTableState<RNAMetadata[number]>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const RNADimensionalityReduction = () => {
  const { ref: umapRef, ...umapDownload } = usePlotDownload();
  const { ref: pcaRef, ...pcaDownload } = usePlotDownload();
  const RNAData = useRNAData({ skip: false });

  const sampleTable = useSampleTable("RNA", RNAData.data);

  const SharedRNADimenionalityProps: SharedRNADimenionalityProps = {
    RNAData,
    sampleTable,
  };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      {...TWO_PANE_HEIGHTS}
      TableComponent={
        <SampleTable
          label="RNA-seq Dimensionality Reduction"
          table={sampleTable}
          loading={RNAData.loading}
          error={RNAData.error}
        />
      }
      plots={[
        {
          tabTitle: "PCA",
          icon: <ScatterPlot />,
          plotComponent: <RNADimensionalityPCAPlot ref={pcaRef} {...SharedRNADimenionalityProps} />,
          ...pcaDownload,
        },
        {
          tabTitle: "UMAP",
          icon: <ScatterPlot />,
          plotComponent: <RNADimensionalityScatterPlot ref={umapRef} {...SharedRNADimenionalityProps} />,
          ...umapDownload,
        },
      ]}
    />
  );
};

export default RNADimensionalityReduction;
