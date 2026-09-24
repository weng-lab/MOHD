"use client";
import { SyncedTableProps, TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import MetallomicsDimensionalityTable from "./MetallomicsDimensionalityTable";
import { ScatterPlot } from "@mui/icons-material";
import MetallomicsPCA from "./MetallomicsPCA";
import { DownloadPlotHandle } from "@weng-lab/visualization";

import {
  useMetallomicsDimensionalityReduction,
  UseMetallomicsDimensionalityReductionReturn,
} from "@/common/hooks/omeHooks/useMetallomicsDimensionalityReduction";
import { useOmeQuantificationTable } from "@/common/components/OmeQuantification/OmeQuantificationTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type MetallomicsDimenionalityMetadata = NonNullable<UseMetallomicsDimensionalityReductionReturn["data"]>;

export type SharedMetallomicsDimenionalityProps = {
  rows: MetallomicsDimenionalityMetadata;
  metallomicsMetadata: UseMetallomicsDimensionalityReductionReturn;
  selected: MetallomicsDimenionalityMetadata;
  setSelected: React.Dispatch<React.SetStateAction<MetallomicsDimenionalityMetadata>>;
  sortedFilteredData: MetallomicsDimenionalityMetadata;
  syncedTableProps: SyncedTableProps<MetallomicsDimenionalityMetadata[number]>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const MetallomicsDimensionalityReduction = () => {
  const { ref: pcaRef, ...pcaDownload } = usePlotDownload();
  const metallomicsMetadata = useMetallomicsDimensionalityReduction({ skip: false });

  const rows: MetallomicsDimenionalityMetadata = metallomicsMetadata.data ?? [];

  const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
    rows,
    getRowId: (row) => row.sample_id,
  });
  const { syncedTableProps } = useOmeQuantificationTable({ rows, tableProps });

  const SharedMetallomicsDimenionalityProps: SharedMetallomicsDimenionalityProps = {
    rows,
    metallomicsMetadata,
    selected,
    setSelected,
    sortedFilteredData,
    syncedTableProps,
  };

  return (
    <TwoPaneLayout
      showTabLabels
      direction={{ xs: "column", lg: "row" }}
      rowHeight="max(60vh, 700px)"
      TableComponent={<MetallomicsDimensionalityTable {...SharedMetallomicsDimenionalityProps} />}
      plots={[
        {
          tabTitle: "PCA",
          icon: <ScatterPlot />,
          plotComponent: <MetallomicsPCA ref={pcaRef} {...SharedMetallomicsDimenionalityProps} />,
          ...pcaDownload,
        },
      ]}
    />
  );
};

export default MetallomicsDimensionalityReduction;
