import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedLipidomicsDimenionalityProps } from "./page";

const LipidomicsDimensionalityTable = ({
  rows,
  lipidomicsMetadata,
  syncedTableProps,
}: SharedLipidomicsDimenionalityProps) => (
  <OmeQuantificationTable
    label="Lipidomics Dimensionality Reduction"
    rows={rows}
    loading={lipidomicsMetadata.loading}
    error={lipidomicsMetadata.error}
    syncedTableProps={syncedTableProps}
  />
);

export default LipidomicsDimensionalityTable;
