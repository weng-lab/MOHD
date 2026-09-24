"use client";
import { SyncedTableProps, TwoPaneLayout, useTablePlotSync } from "@weng-lab/ui-components";
import LipidomicsDimensionalityTable from "./LipidomicsDimensionalityTable";
import { ScatterPlot } from "@mui/icons-material";
import LipidomicsPCA from "./LipidomicsPCA";
import { DownloadPlotHandle } from "@weng-lab/visualization";

import {
  useLipidomicsDimensionalityReduction,
  UseLipidomicsDimensionalityReductionReturn,
} from "@/common/hooks/omeHooks/useLipidomicsDimensionalityReduction";
import { useOmeQuantificationTable } from "@/common/components/OmeQuantification/OmeQuantificationTable";
import usePlotDownload from "@/common/hooks/usePlotDownload";

export type LipidomicsDimenionalityMetadata = NonNullable<UseLipidomicsDimensionalityReductionReturn["data"]>;

export type SharedLipidomicsDimenionalityProps = {
  rows: LipidomicsDimenionalityMetadata;
  lipidomicsMetadata: UseLipidomicsDimensionalityReductionReturn;
  selected: LipidomicsDimenionalityMetadata;
  setSelected: React.Dispatch<React.SetStateAction<LipidomicsDimenionalityMetadata>>;
  sortedFilteredData: LipidomicsDimenionalityMetadata;
  syncedTableProps: SyncedTableProps<LipidomicsDimenionalityMetadata[number]>;
  ref?: React.RefObject<DownloadPlotHandle | null>;
};

const LipidomicsDimensionalityReduction = () => {
  const { ref: pcaRef, ...pcaDownload } = usePlotDownload();
  const lipidomicsMetadata = useLipidomicsDimensionalityReduction({ skip: false });

  const rows: LipidomicsDimenionalityMetadata = lipidomicsMetadata.data ?? [];

  const { selected, setSelected, sortedFilteredData, tableProps } = useTablePlotSync({
    rows,
    getRowId: (row) => row.sample_id,
  });
  const { syncedTableProps } = useOmeQuantificationTable({ rows, tableProps });

  const SharedLipidomicsDimenionalityProps: SharedLipidomicsDimenionalityProps = {
    rows,
    lipidomicsMetadata,
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
      TableComponent={<LipidomicsDimensionalityTable {...SharedLipidomicsDimenionalityProps} />}
      plots={[
        {
          tabTitle: "PCA",
          icon: <ScatterPlot />,
          plotComponent: <LipidomicsPCA ref={pcaRef} {...SharedLipidomicsDimenionalityProps} />,
          ...pcaDownload,
        },
      ]}
    />
  );
};

export default LipidomicsDimensionalityReduction;
