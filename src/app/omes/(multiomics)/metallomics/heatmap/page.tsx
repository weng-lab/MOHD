"use client";
import { SyncedTableProps, TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import MetallomicsQuantificationTable from "./MetallomicsQuantificationTable";
import { GridOn } from "@mui/icons-material";
import MetallomicsQuantificationHeatmap from "./MetallomicsQuantificationHeatmap";
import { DownloadPlotHandle } from "@weng-lab/visualization";
import { useMetallomicsData, UseMetallomicsDataReturn } from "@/common/hooks/omeHooks/useMetallomicsData";
import { useOmeQuantificationTable } from "@/common/components/OmeQuantification/OmeQuantificationTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type MetallomicsSample = NonNullable<NonNullable<UseMetallomicsDataReturn["data"]>[number]>;
export type MetallomicsMetadata = MetallomicsSample[];

export type SharedMetallomicsProps = {
  rows: MetallomicsMetadata;
  metallomicsData: UseMetallomicsDataReturn;
  selected: MetallomicsMetadata;
  setSelected: React.Dispatch<React.SetStateAction<MetallomicsMetadata>>;
  sortedFilteredData: MetallomicsMetadata;
  syncedTableProps: SyncedTableProps<MetallomicsSample>;
  autoSort: boolean;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const MetallomicsHeatmap = () => {
  const { ref: baseHeatmapRef, ...baseHeatmapDownload } = usePlotDownload();
  const { ref: ucrHeatmapRef, ...ucrHeatmapDownload } = usePlotDownload();
  const metallomicsData = useMetallomicsData({ skip: false });

  const rows: MetallomicsMetadata = metallomicsData.data
    ? metallomicsData.data.filter((row): row is MetallomicsSample => row !== null)
    : [];

  const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
    rows,
    getRowId: (row) => row.sample_id,
  });
  const { syncedTableProps, autoSort } = useOmeQuantificationTable({ rows, tableProps });

  const SharedMetallomicsProps: SharedMetallomicsProps = {
    rows,
    metallomicsData,
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
      TableComponent={<MetallomicsQuantificationTable {...SharedMetallomicsProps} />}
      plots={[
        {
          tabTitle: "Base Metals",
          icon: <GridOn />,
          plotComponent: (
            <MetallomicsQuantificationHeatmap
              ref={baseHeatmapRef}
              metalGroup="base"
              downloadFileName="metallomics_quantification_heatmap_base_metals"
              {...SharedMetallomicsProps}
            />
          ),
          ...baseHeatmapDownload,
          dataDownloadLinks: [
            {
              title: "Metallomics Quantification (TSV)",
              link: "https://downloads.mohdconsortium.org/Metals/snapshot1_metallomics_quant.tsv",
            },
          ],
        },
        {
          tabTitle: "UCr-Normalized",
          icon: <GridOn />,
          plotComponent: (
            <MetallomicsQuantificationHeatmap
              ref={ucrHeatmapRef}
              metalGroup="ucr"
              downloadFileName="metallomics_quantification_heatmap_ucr_normalized"
              {...SharedMetallomicsProps}
            />
          ),
          ...ucrHeatmapDownload,
          dataDownloadLinks: [
            {
              title: "Metallomics Quantification (TSV)",
              link: "https://downloads.mohdconsortium.org/Metals/snapshot1_metallomics_quant.tsv",
            },
          ],
        },
      ]}
    />
  );
};

export default MetallomicsHeatmap;
