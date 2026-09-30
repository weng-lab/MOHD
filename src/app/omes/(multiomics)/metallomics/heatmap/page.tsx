"use client";
import { TwoPaneLayout } from "@weng-lab/ui-components";
import { GridOn } from "@mui/icons-material";
import MetallomicsQuantificationHeatmap from "./MetallomicsQuantificationHeatmap";
import { DownloadPlotHandle } from "@weng-lab/visualization";
import {
  useMetallomicsData,
  UseMetallomicsDataReturn,
  MetallomicsSample,
} from "@/common/hooks/omeHooks/useMetallomicsData";
import SampleTable from "@/common/sampleFields/SampleTable";
import { useSampleTable, type SampleTableState } from "@/common/sampleFields/useSampleTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";
import { TWO_PANE_HEIGHTS } from "@/common/components/OmeDetails/omePageHeight";

export type SharedMetallomicsProps = {
  metallomicsData: UseMetallomicsDataReturn;
  sampleTable: SampleTableState<MetallomicsSample>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const MetallomicsHeatmap = () => {
  const { ref: baseHeatmapRef, ...baseHeatmapDownload } = usePlotDownload();
  const { ref: ucrHeatmapRef, ...ucrHeatmapDownload } = usePlotDownload();
  const metallomicsData = useMetallomicsData({ skip: false });

  const sampleTable = useSampleTable("metallomics", metallomicsData.data);

  const SharedMetallomicsProps: SharedMetallomicsProps = { metallomicsData, sampleTable };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      {...TWO_PANE_HEIGHTS}
      TableComponent={
        <SampleTable
          label="Metallomics Quantification"
          table={sampleTable}
          loading={metallomicsData.loading}
          error={metallomicsData.error}
        />
      }
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
