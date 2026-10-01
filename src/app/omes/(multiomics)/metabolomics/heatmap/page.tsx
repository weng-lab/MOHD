"use client";
import { TwoPaneLayout } from "@weng-lab/ui-components";
import { GridOn } from "@mui/icons-material";
import MetabolomicsQuantificationHeatmap from "./MetabolomicsQuantificationHeatmap";
import { DownloadPlotHandle } from "@weng-lab/visualization";
import {
  useMetabolomicsQuantification,
  UseMetabolomicsQuantificationReturn,
  MetabolomicsSample,
} from "@/common/hooks/omeHooks/useMetabolomicsQuantification";
import SampleTable from "@/common/sampleFields/SampleTable";
import { useSampleTable, type SampleTableState } from "@/common/sampleFields/useSampleTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";
import { TWO_PANE_HEIGHTS } from "@/common/components/OmeDetails/omePageHeight";

export type SharedMetabolomicsProps = {
  metabolomicsData: UseMetabolomicsQuantificationReturn;
  sampleTable: SampleTableState<MetabolomicsSample>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const MetabolomicsHeatmap = () => {
  const { ref: heatmapRef, ...heatmapDownload } = usePlotDownload();
  const metabolomicsData = useMetabolomicsQuantification({ skip: false });

  const sampleTable = useSampleTable("metabolomics", metabolomicsData.data);

  const SharedMetabolomicsProps: SharedMetabolomicsProps = { metabolomicsData, sampleTable };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      {...TWO_PANE_HEIGHTS}
      TableComponent={
        <SampleTable
          label="Metabolomics Quantification"
          table={sampleTable}
          loading={metabolomicsData.loading}
          error={metabolomicsData.error}
        />
      }
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
