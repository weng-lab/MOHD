import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedMetabolomicsDimenionalityProps } from "./page";

const MetabolomicsDimensionalityTable = ({
  rows,
  metabolomicsMetadata,
  tableProps,
  setAutoSort,
}: SharedMetabolomicsDimenionalityProps) => (
  <OmeQuantificationTable
    label="Metabolomics Dimensionality Reduction"
    rows={rows}
    loading={metabolomicsMetadata.loading}
    error={metabolomicsMetadata.error}
    tableProps={tableProps}
    setAutoSort={setAutoSort}
  />
);

export default MetabolomicsDimensionalityTable;
