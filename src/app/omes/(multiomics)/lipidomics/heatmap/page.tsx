"use client";
import { SyncedTableProps, TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import LipidomicsQuantificationTable from "./LipidomicsQuantificationTable";
import { GridOn } from "@mui/icons-material";
import LipidomicsQuantificationHeatmap from "./LipidomicsQuantificationHeatmap";
import { DownloadPlotHandle } from "@weng-lab/visualization";
import {
  useLipidomicsQuantification,
  UseLipidomicsQuantificationReturn,
  LipidomicsSample,
} from "@/common/hooks/omeHooks/useLipidomicsQuantification";
import { useOmeQuantificationTable } from "@/common/components/OmeQuantification/OmeQuantificationTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type LipidomicsMetadata = LipidomicsSample[];

export type SharedLipidomicsProps = {
  rows: LipidomicsMetadata;
  lipidomicsData: UseLipidomicsQuantificationReturn;
  selected: LipidomicsMetadata;
  setSelected: React.Dispatch<React.SetStateAction<LipidomicsMetadata>>;
  sortedFilteredData: LipidomicsMetadata;
  syncedTableProps: SyncedTableProps<LipidomicsSample>;
  autoSort: boolean;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const LipidomicsHeatmap = () => {
  const { ref: heatmapRef, ...heatmapDownload } = usePlotDownload();
  const lipidomicsData = useLipidomicsQuantification({ skip: false });

  const rows: LipidomicsMetadata = lipidomicsData.data ?? [];

  const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
    rows,
    getRowId: (row) => row.sample_id,
  });
  const { syncedTableProps, autoSort } = useOmeQuantificationTable({ rows, tableProps });

  const SharedLipidomicsProps: SharedLipidomicsProps = {
    rows,
    lipidomicsData,
    selected,
    setSelected,
    sortedFilteredData,
    syncedTableProps,
    autoSort,
  };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      rowHeight="max(60vh, 700px)"
      TableComponent={<LipidomicsQuantificationTable {...SharedLipidomicsProps} />}
      plots={[
        {
          tabTitle: "Heatmap",
          icon: <GridOn />,
          plotComponent: <LipidomicsQuantificationHeatmap ref={heatmapRef} {...SharedLipidomicsProps} />,
          ...heatmapDownload,
          dataDownloadLinks: [
            {
              title: "Lipidomics Quantification (TSV)",
              link: "https://downloads.mohdconsortium.org/6_Lipidomics/snapshot1_lipidomics_quant.tsv",
            },
          ],
        },
      ]}
    />
  );
};

export default LipidomicsHeatmap;
