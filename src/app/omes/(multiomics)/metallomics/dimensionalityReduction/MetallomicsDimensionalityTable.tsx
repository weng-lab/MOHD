import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedMetallomicsDimenionalityProps } from "./page";

const MetallomicsDimensionalityTable = ({
  rows,
  metallomicsMetadata,
  syncedTableProps,
}: SharedMetallomicsDimenionalityProps) => (
  <OmeQuantificationTable
    label="Metallomics Dimensionality Reduction"
    rows={rows}
    loading={metallomicsMetadata.loading}
    error={metallomicsMetadata.error}
    syncedTableProps={syncedTableProps}
  />
);

export default MetallomicsDimensionalityTable;
