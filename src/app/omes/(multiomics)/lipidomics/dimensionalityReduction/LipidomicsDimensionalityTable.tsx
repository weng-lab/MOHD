import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedLipidomicsDimenionalityProps } from "./page";

const LipidomicsDimensionalityTable = ({
  rows,
  lipidomicsMetadata,
  tableProps,
  setAutoSort,
}: SharedLipidomicsDimenionalityProps) => (
  <OmeQuantificationTable
    label="Lipidomics Dimensionality Reduction"
    rows={rows}
    loading={lipidomicsMetadata.loading}
    error={lipidomicsMetadata.error}
    tableProps={tableProps}
    setAutoSort={setAutoSort}
  />
);

export default LipidomicsDimensionalityTable;
