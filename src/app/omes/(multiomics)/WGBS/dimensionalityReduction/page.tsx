"use client";
import { SyncedTableProps, TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import WGBSDimensionalityTable from "./WGBSDimensionalityTable";
import { ScatterPlot } from "@mui/icons-material";
import WGBSDimensionalityScatterPlot from "./WGBSUMAP";
import WGBSDimensionalityPCAPlot from "./WGBSPCA";
import { DownloadPlotHandle } from "@weng-lab/visualization";

import { useWGBSData, UseWGBSDataReturn } from "@/common/hooks/omeHooks/useWGBSData";
import { useOmeQuantificationTable } from "@/common/components/OmeQuantification/OmeQuantificationTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type WGBSMetadata = NonNullable<UseWGBSDataReturn["data"]>;

export type SharedWGBSDimenionalityProps = {
  rows: WGBSMetadata;
  WGBSData: UseWGBSDataReturn;
  selected: WGBSMetadata;
  setSelected: React.Dispatch<React.SetStateAction<WGBSMetadata>>;
  sortedFilteredData: WGBSMetadata;
  syncedTableProps: SyncedTableProps<WGBSMetadata[number]>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const WGBSDimensionalityReduction = () => {
  const { ref: umapRef, ...umapDownload } = usePlotDownload();
  const { ref: pcaRef, ...pcaDownload } = usePlotDownload();
  const WGBSData = useWGBSData({ skip: false });

  const rows: WGBSMetadata = WGBSData.data ?? [];

  const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
    rows,
    getRowId: (row) => row.sample_id,
  });
  const { syncedTableProps } = useOmeQuantificationTable({ rows, tableProps, hasAge: true });

  const SharedWGBSDimenionalityProps: SharedWGBSDimenionalityProps = {
    rows,
    WGBSData,
    selected,
    setSelected,
    sortedFilteredData,
    syncedTableProps,
  };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      rowHeight="max(60vh, 700px)"
      TableComponent={<WGBSDimensionalityTable {...SharedWGBSDimenionalityProps} />}
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
