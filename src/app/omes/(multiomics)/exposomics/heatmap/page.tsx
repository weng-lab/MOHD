"use client";
import { SyncedTableProps, TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import ExposomicsQuantificationTable from "./ExposomicsQuantificationTable";
import { GridOn } from "@mui/icons-material";
import ExposomicsQuantificationHeatmap from "./ExposomicsQuantificationHeatmap";
import { DownloadPlotHandle } from "@weng-lab/visualization";
import {
  useExposomicsData,
  UseExposomicsDataReturn,
  ExposomicsSample,
} from "@/common/hooks/omeHooks/useExposomicsData";
import { useOmeQuantificationTable } from "@/common/components/OmeQuantification/OmeQuantificationTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type ExposomicsMetadata = ExposomicsSample[];

export type SharedExposomicsProps = {
  rows: ExposomicsMetadata;
  exposomicsData: UseExposomicsDataReturn;
  selected: ExposomicsMetadata;
  setSelected: React.Dispatch<React.SetStateAction<ExposomicsMetadata>>;
  sortedFilteredData: ExposomicsMetadata;
  syncedTableProps: SyncedTableProps<ExposomicsSample>;
  autoSort: boolean;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const ExposomicsHeatmap = () => {
  const { ref: heatmapRef, ...heatmapDownload } = usePlotDownload();
  const exposomicsData = useExposomicsData({ skip: false });

  const rows: ExposomicsMetadata = exposomicsData.data ?? [];

  const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
    rows,
    getRowId: (row) => row.sample_id,
  });
  const { syncedTableProps, autoSort } = useOmeQuantificationTable({ rows, tableProps });

  const SharedExposomicsProps: SharedExposomicsProps = {
    rows,
    exposomicsData,
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
      TableComponent={<ExposomicsQuantificationTable {...SharedExposomicsProps} />}
      plots={[
        {
          tabTitle: "Heatmap",
          icon: <GridOn />,
          plotComponent: <ExposomicsQuantificationHeatmap ref={heatmapRef} {...SharedExposomicsProps} />,
          ...heatmapDownload,
          dataDownloadLinks: [
            {
              title: "Exposomics Quantification (TSV)",
              link: "https://downloads.mohdconsortium.org/7_Exposomics/snapshot1_exposomics_quant.tsv",
            },
          ],
        },
      ]}
    />
  );
};

export default ExposomicsHeatmap;
