"use client";
import { TwoPaneLayout } from "@weng-lab/ui-components";
import { ScatterPlot } from "@mui/icons-material";
import ATACDimensionalityScatterPlot from "./ATACUMAP";
import ATACDimensionalityPCAPlot from "./ATACPCA";
import { DownloadPlotHandle } from "@weng-lab/visualization";

import { useATACData, UseATACDataReturn } from "@/common/hooks/omeHooks/useATACData";
import SampleTable from "@/common/sampleFields/SampleTable";
import { useSampleTable, type SampleTableState } from "@/common/sampleFields/useSampleTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";
import { TWO_PANE_HEIGHTS } from "@/common/components/OmeDetails/omePageHeight";
import { SHOW_UMAP } from "@/common/umap";
import { ATAC_PROTOCOLS, type AtacProtocolKey } from "@/common/atacProtocols";
import { labelOf } from "@/common/sampleFields/fields";
import { onlyValue } from "@/common/sampleFields/tableFilters";

export type ATACMetadata = NonNullable<UseATACDataReturn["data"]>;

export type SharedATACDimenionalityProps = {
  ATACData: UseATACDataReturn;
  sampleTable: SampleTableState<ATACMetadata[number]>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const ATACDimensionalityReduction = () => {
  const { ref: umapRef, ...umapDownload } = usePlotDownload();
  // Spelled out, as hooks can't be called in a loop: a protocol added without one fails to compile.
  const pcaDownloads: Record<AtacProtocolKey, ReturnType<typeof usePlotDownload>> = {
    CPT: usePlotDownload(),
    OPC: usePlotDownload(),
    BuffyCoat: usePlotDownload(),
  };
  const ATACData = useATACData({ skip: false });

  // The layout opens on the first protocol's tab, so the table starts on that protocol's samples alone.
  const sampleTable = useSampleTable("ATAC", ATACData.data, {
    initialFilters: onlyValue({ items: [] }, "protocol", ATAC_PROTOCOLS[0].value),
  });

  const SharedATACDimenionalityProps: SharedATACDimenionalityProps = {
    ATACData,
    sampleTable,
  };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      {...TWO_PANE_HEIGHTS}
      // A protocol's tab filters the table down to its samples, the ones its plot draws, keeping the
      // other filters. The UMAP tab, after the protocols' (off - see SHOW_UMAP), leaves the table be.
      onTabChange={(index) => {
        if (index < ATAC_PROTOCOLS.length) sampleTable.filterTo("protocol", ATAC_PROTOCOLS[index].value);
      }}
      TableComponent={
        <SampleTable
          label="ATAC-seq Dimensionality Reduction"
          table={sampleTable}
          loading={ATACData.loading}
          error={ATACData.error}
        />
      }
      plots={[
        // A tab per protocol, since each protocol's samples had a PCA of their own. Named
        // "Protocol: CPT", as a bare "CPT" doesn't say what it is.
        ...ATAC_PROTOCOLS.map((protocol) => {
          const { ref, ...download } = pcaDownloads[protocol.key];
          return {
            tabTitle: `Protocol: ${labelOf("protocol", protocol.value)}`,
            icon: <ScatterPlot />,
            plotComponent: (
              <ATACDimensionalityPCAPlot ref={ref} protocol={protocol} {...SharedATACDimenionalityProps} />
            ),
            ...download,
          };
        }),
        // Off until UMAP comes back - see SHOW_UMAP.
        ...(SHOW_UMAP
          ? [
              {
                tabTitle: "UMAP",
                icon: <ScatterPlot />,
                plotComponent: <ATACDimensionalityScatterPlot ref={umapRef} {...SharedATACDimenionalityProps} />,
                ...umapDownload,
              },
            ]
          : []),
      ]}
    />
  );
};

export default ATACDimensionalityReduction;
