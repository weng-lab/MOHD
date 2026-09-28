"use client";
import { TwoPaneLayout } from "@weng-lab/ui-components";
import { ScatterPlot } from "@mui/icons-material";
import LipidomicsPCA from "./LipidomicsPCA";
import { DownloadPlotHandle } from "@weng-lab/visualization";

import {
  useLipidomicsDimensionalityReduction,
  UseLipidomicsDimensionalityReductionReturn,
} from "@/common/hooks/omeHooks/useLipidomicsDimensionalityReduction";
import SampleTable from "@/common/sampleFields/SampleTable";
import { useSampleTable, type SampleTableState } from "@/common/sampleFields/useSampleTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type LipidomicsDimenionalityMetadata = NonNullable<UseLipidomicsDimensionalityReductionReturn["data"]>;

export type SharedLipidomicsDimenionalityProps = {
  lipidomicsMetadata: UseLipidomicsDimensionalityReductionReturn;
  sampleTable: SampleTableState<LipidomicsDimenionalityMetadata[number]>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const LipidomicsDimensionalityReduction = () => {
  const { ref: pcaRef, ...pcaDownload } = usePlotDownload();
  const lipidomicsMetadata = useLipidomicsDimensionalityReduction({ skip: false });

  const sampleTable = useSampleTable("lipidomics", lipidomicsMetadata.data);

  const SharedLipidomicsDimenionalityProps: SharedLipidomicsDimenionalityProps = {
    lipidomicsMetadata,
    sampleTable,
  };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      rowHeight="max(60vh, 700px)"
      TableComponent={
        <SampleTable
          label="Lipidomics Dimensionality Reduction"
          table={sampleTable}
          loading={lipidomicsMetadata.loading}
          error={lipidomicsMetadata.error}
        />
      }
      plots={[
        {
          tabTitle: "PCA",
          icon: <ScatterPlot />,
          plotComponent: <LipidomicsPCA ref={pcaRef} {...SharedLipidomicsDimenionalityProps} />,
          ...pcaDownload,
        },
      ]}
    />
  );
};

export default LipidomicsDimensionalityReduction;
