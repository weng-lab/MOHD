"use client";
import { TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import LipidomicsQuantificationTable from "./LipidomicsQuantificationTable";
import { GridOn } from "@mui/icons-material";
import LipidomicsQuantificationHeatmap from "./LipidomicsQuantificationHeatmap";
import { useState } from "react";
import { DownloadPlotHandle } from "@weng-lab/visualization";
import {
  useLipidomicsData,
  UseLipidomicsDataReturn,
  LipidomicsSample,
} from "@/common/hooks/omeHooks/useLipidomicsData";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type LipidomicsMetadata = LipidomicsSample[];

export type SharedLipidomicsProps = {
  rows: LipidomicsMetadata;
  lipidomicsData: UseLipidomicsDataReturn;
  selected: LipidomicsMetadata;
  setSelected: React.Dispatch<React.SetStateAction<LipidomicsMetadata>>;
  sortedFilteredData: LipidomicsMetadata;
  tableProps: ReturnType<typeof useTablePlotSync<LipidomicsSample>>["tableProps"];
  autoSort: boolean;
  setAutoSort: React.Dispatch<React.SetStateAction<boolean>>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const LipidomicsHeatmap = () => {
  const { ref: heatmapRef, ...heatmapDownload } = usePlotDownload();
  const lipidomicsData = useLipidomicsData({ skip: false });

  const rows: LipidomicsMetadata = lipidomicsData.data ?? [];

  const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
    rows,
    getRowId: (row) => row.sample_id,
  });
  const [autoSort, setAutoSort] = useState(false);

  const SharedLipidomicsProps: SharedLipidomicsProps = {
    rows,
    lipidomicsData,
    selected,
    setSelected,
    sortedFilteredData,
    tableProps,
    autoSort,
    setAutoSort,
  };

  return (
    <TwoPaneLayout
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
