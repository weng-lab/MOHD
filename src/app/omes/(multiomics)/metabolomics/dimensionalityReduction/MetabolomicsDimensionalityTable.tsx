import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedMetabolomicsDimenionalityProps } from "./page";

const MetabolomicsDimensionalityTable = ({
  rows,
  metabolomicsMetadata,
  syncedTableProps,
}: SharedMetabolomicsDimenionalityProps) => (
  <OmeQuantificationTable
    label="Metabolomics Dimensionality Reduction"
    rows={rows}
    loading={metabolomicsMetadata.loading}
    error={metabolomicsMetadata.error}
    syncedTableProps={syncedTableProps}
  />
);

export default MetabolomicsDimensionalityTable;
