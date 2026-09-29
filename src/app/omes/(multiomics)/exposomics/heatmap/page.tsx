"use client";
import { TwoPaneLayout } from "@weng-lab/ui-components";
import { GridOn } from "@mui/icons-material";
import ExposomicsQuantificationHeatmap from "./ExposomicsQuantificationHeatmap";
import { DownloadPlotHandle } from "@weng-lab/visualization";
import {
  useExposomicsData,
  UseExposomicsDataReturn,
  ExposomicsSample,
} from "@/common/hooks/omeHooks/useExposomicsData";
import SampleTable from "@/common/sampleFields/SampleTable";
import { useSampleTable, type SampleTableState } from "@/common/sampleFields/useSampleTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";
import { TWO_PANE_HEIGHTS } from "@/common/components/OmeDetails/omePageHeight";

export type SharedExposomicsProps = {
  exposomicsData: UseExposomicsDataReturn;
  sampleTable: SampleTableState<ExposomicsSample>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const ExposomicsHeatmap = () => {
  const { ref: heatmapRef, ...heatmapDownload } = usePlotDownload();
  const exposomicsData = useExposomicsData({ skip: false });

  const sampleTable = useSampleTable("exposomics", exposomicsData.data);

  const SharedExposomicsProps: SharedExposomicsProps = { exposomicsData, sampleTable };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      {...TWO_PANE_HEIGHTS}
      TableComponent={
        <SampleTable
          label="Exposomics Quantification"
          table={sampleTable}
          loading={exposomicsData.loading}
          error={exposomicsData.error}
        />
      }
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
