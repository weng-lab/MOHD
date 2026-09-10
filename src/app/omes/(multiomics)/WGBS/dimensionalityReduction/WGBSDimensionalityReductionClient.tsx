"use client";
import { SyncedTableProps, TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import WGBSDimensionalityTable from "./WGBSDimensionalityTable";
import { ScatterPlot } from "@mui/icons-material";
import WGBSDimensionalityScatterPlot from "./WGBSUMAP";
import WGBSDimensionalityPCAPlot from "./WGBSPCA";
import { DownloadPlotHandle } from "@weng-lab/visualization";
import { useOmeQuantificationTable } from "@/common/components/OmeQuantification/OmeQuantificationTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";
import type { WGBSRow } from "./types";

export type SharedWGBSDimenionalityProps = {
  rows: WGBSRow[];
  selected: WGBSRow[];
  setSelected: React.Dispatch<React.SetStateAction<WGBSRow[]>>;
  sortedFilteredData: WGBSRow[];
  syncedTableProps: SyncedTableProps<WGBSRow>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

export type WGBSDimensionalityReductionClientProps = {
  rows: WGBSRow[];
};

const WGBSDimensionalityReductionClient = ({ rows }: WGBSDimensionalityReductionClientProps) => {
  const { ref: umapRef, ...umapDownload } = usePlotDownload();
  const { ref: pcaRef, ...pcaDownload } = usePlotDownload();

  const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
    rows,
    getRowId: (row) => row.sample_id,
  });
  const { syncedTableProps } = useOmeQuantificationTable({ rows, tableProps });

  const SharedWGBSDimenionalityProps: SharedWGBSDimenionalityProps = {
    rows,
    selected,
    setSelected,
    sortedFilteredData,
    syncedTableProps,
  };

  return (
    <TwoPaneLayout
      direction={{ xs: "column", lg: "row" }}
      rowHeight="max(60vh, 700px)"
      TableComponent={<WGBSDimensionalityTable {...SharedWGBSDimenionalityProps} />}
      plots={[
        {
          tabTitle: "UMAP",
          icon: <ScatterPlot />,
          plotComponent: <WGBSDimensionalityScatterPlot ref={umapRef} {...SharedWGBSDimenionalityProps} />,
          ...umapDownload,
        },
        {
          tabTitle: "PCA",
          icon: <ScatterPlot />,
          plotComponent: <WGBSDimensionalityPCAPlot ref={pcaRef} {...SharedWGBSDimenionalityProps} />,
          ...pcaDownload,
        },
      ]}
    />
  );
};

export default WGBSDimensionalityReductionClient;
