"use client";
import { TwoPaneLayout } from "@weng-lab/ui-components";
import { GridOn } from "@mui/icons-material";
import LipidomicsQuantificationHeatmap from "./LipidomicsQuantificationHeatmap";
import { DownloadPlotHandle } from "@weng-lab/visualization";
import {
  useLipidomicsQuantification,
  UseLipidomicsQuantificationReturn,
  LipidomicsSample,
} from "@/common/hooks/omeHooks/useLipidomicsQuantification";
import SampleTable from "@/common/sampleFields/SampleTable";
import { useSampleTable, type SampleTableState } from "@/common/sampleFields/useSampleTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";
import { TWO_PANE_HEIGHTS } from "@/common/components/OmeDetails/omePageHeight";

export type SharedLipidomicsProps = {
  lipidomicsData: UseLipidomicsQuantificationReturn;
  sampleTable: SampleTableState<LipidomicsSample>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const LipidomicsHeatmap = () => {
  const { ref: heatmapRef, ...heatmapDownload } = usePlotDownload();
  const lipidomicsData = useLipidomicsQuantification({ skip: false });

  const sampleTable = useSampleTable("lipidomics", lipidomicsData.data);

  const SharedLipidomicsProps: SharedLipidomicsProps = { lipidomicsData, sampleTable };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      {...TWO_PANE_HEIGHTS}
      TableComponent={
        <SampleTable
          label="Lipidomics Quantification"
          table={sampleTable}
          loading={lipidomicsData.loading}
          error={lipidomicsData.error}
        />
      }
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
