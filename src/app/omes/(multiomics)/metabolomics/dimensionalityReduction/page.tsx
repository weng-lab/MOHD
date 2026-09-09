"use client";
import { useState } from "react";
import { TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import MetabolomicsDimensionalityTable from "./MetabolomicsDimensionalityTable";
import { ScatterPlot } from "@mui/icons-material";
import MetabolomicsPCA from "./MetabolomicsPCA";
import { DownloadPlotHandle } from "@weng-lab/visualization";

import {
  useMetabolomicsDimensionalityReduction,
  UseMetabolomicsDimensionalityReductionReturn,
} from "@/common/hooks/omeHooks/useMetabolomicsDimensionalityReduction";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type MetabolomicsDimenionalityMetadata = NonNullable<UseMetabolomicsDimensionalityReductionReturn["data"]>;

export type SharedMetabolomicsDimenionalityProps = {
  rows: MetabolomicsDimenionalityMetadata;
  metabolomicsMetadata: UseMetabolomicsDimensionalityReductionReturn;
  selected: MetabolomicsDimenionalityMetadata;
  setSelected: React.Dispatch<React.SetStateAction<MetabolomicsDimenionalityMetadata>>;
  sortedFilteredData: MetabolomicsDimenionalityMetadata;
  tableProps: ReturnType<typeof useTablePlotSync<MetabolomicsDimenionalityMetadata[number]>>["tableProps"];
  setAutoSort: React.Dispatch<React.SetStateAction<boolean>>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const MetabolomicsDimensionalityReduction = () => {
  const { ref: pcaRef, ...pcaDownload } = usePlotDownload();
  const metabolomicsMetadata = useMetabolomicsDimensionalityReduction({ skip: false });

  const rows: MetabolomicsDimenionalityMetadata = metabolomicsMetadata.data ?? [];

  const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
    rows,
    getRowId: (row) => row.sample_id,
  });
  const [, setAutoSort] = useState(false);

  const SharedMetabolomicsDimenionalityProps: SharedMetabolomicsDimenionalityProps = {
    rows,
    metabolomicsMetadata,
    selected,
    setSelected,
    sortedFilteredData,
    tableProps,
    setAutoSort,
  };

  return (
    <TwoPaneLayout
      direction={{ xs: "column", lg: "row" }}
      rowHeight="max(60vh, 700px)"
      TableComponent={<MetabolomicsDimensionalityTable {...SharedMetabolomicsDimenionalityProps} />}
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
