"use client";
import { SyncedTableProps, TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import MetabolomicsQuantificationTable from "./MetabolomicsQuantificationTable";
import { GridOn } from "@mui/icons-material";
import MetabolomicsQuantificationHeatmap from "./MetabolomicsQuantificationHeatmap";
import { DownloadPlotHandle } from "@weng-lab/visualization";
import {
  useMetabolomicsQuantification,
  UseMetabolomicsQuantificationReturn,
  MetabolomicsSample,
} from "@/common/hooks/omeHooks/useMetabolomicsQuantification";
import { useOmeQuantificationTable } from "@/common/components/OmeQuantification/OmeQuantificationTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type MetabolomicsMetadata = MetabolomicsSample[];

export type SharedMetabolomicsProps = {
  rows: MetabolomicsMetadata;
  metabolomicsData: UseMetabolomicsQuantificationReturn;
  selected: MetabolomicsMetadata;
  setSelected: React.Dispatch<React.SetStateAction<MetabolomicsMetadata>>;
  sortedFilteredData: MetabolomicsMetadata;
  syncedTableProps: SyncedTableProps<MetabolomicsSample>;
  autoSort: boolean;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const MetabolomicsHeatmap = () => {
  const { ref: heatmapRef, ...heatmapDownload } = usePlotDownload();
  const metabolomicsData = useMetabolomicsQuantification({ skip: false });

  const rows: MetabolomicsMetadata = metabolomicsData.data ?? [];

  const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
    rows,
    getRowId: (row) => row.sample_id,
  });
  const { syncedTableProps, autoSort } = useOmeQuantificationTable({ rows, tableProps });

  const SharedMetabolomicsProps: SharedMetabolomicsProps = {
    rows,
    metabolomicsData,
    selected,
    setSelected,
    sortedFilteredData,
    syncedTableProps,
    autoSort,
  };

  return (
    <TwoPaneLayout
      direction={{ xs: "column", lg: "row" }}
      rowHeight="max(60vh, 700px)"
      TableComponent={<MetabolomicsQuantificationTable {...SharedMetabolomicsProps} />}
      plots={[
        {
          tabTitle: "Heatmap",
          icon: <GridOn />,
          plotComponent: <MetabolomicsQuantificationHeatmap ref={heatmapRef} {...SharedMetabolomicsProps} />,
          ...heatmapDownload,
          dataDownloadLinks: [
            {
              title: "Metabolomics Quantification (TSV)",
              link: "https://downloads.mohdconsortium.org/5_Metabolomics/snapshot1_metabolomics_quant.tsv",
            },
          ],
        },
      ]}
    />
  );
};

export default MetabolomicsHeatmap;
