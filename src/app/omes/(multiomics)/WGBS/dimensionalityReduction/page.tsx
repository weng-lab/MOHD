"use client";
import { TwoPaneLayout } from "@weng-lab/ui-components";
import { ScatterPlot } from "@mui/icons-material";
import WGBSDimensionalityScatterPlot from "./WGBSUMAP";
import WGBSDimensionalityPCAPlot from "./WGBSPCA";
import { DownloadPlotHandle } from "@weng-lab/visualization";

import { useWGBSData, UseWGBSDataReturn } from "@/common/hooks/omeHooks/useWGBSData";
import SampleTable from "@/common/sampleFields/SampleTable";
import { useSampleTable, type SampleTableState } from "@/common/sampleFields/useSampleTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type WGBSMetadata = NonNullable<UseWGBSDataReturn["data"]>;

export type SharedWGBSDimenionalityProps = {
  WGBSData: UseWGBSDataReturn;
  sampleTable: SampleTableState<WGBSMetadata[number]>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const WGBSDimensionalityReduction = () => {
  const { ref: umapRef, ...umapDownload } = usePlotDownload();
  const { ref: pcaRef, ...pcaDownload } = usePlotDownload();
  const WGBSData = useWGBSData({ skip: false });

  const sampleTable = useSampleTable("WGBS", WGBSData.data);

  const SharedWGBSDimenionalityProps: SharedWGBSDimenionalityProps = {
    WGBSData,
    sampleTable,
  };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      rowHeight="max(60vh, 700px)"
      TableComponent={
        <SampleTable
          label="WGBS Dimensionality Reduction"
          table={sampleTable}
          loading={WGBSData.loading}
          error={WGBSData.error}
        />
      }
      plots={[
        {
          tabTitle: "PCA",
          icon: <ScatterPlot />,
          plotComponent: <WGBSDimensionalityPCAPlot ref={pcaRef} {...SharedWGBSDimenionalityProps} />,
          ...pcaDownload,
        },
        {
          tabTitle: "UMAP",
          icon: <ScatterPlot />,
          plotComponent: <WGBSDimensionalityScatterPlot ref={umapRef} {...SharedWGBSDimenionalityProps} />,
          ...umapDownload,
        },
      ]}
    />
  );
};

export default WGBSDimensionalityReduction;
