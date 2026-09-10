import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedWGBSDimenionalityProps } from "./WGBSDimensionalityReductionClient";

const WGBSDimensionalityTable = ({ rows, syncedTableProps }: SharedWGBSDimenionalityProps) => (
  <OmeQuantificationTable
    label="WGBS Dimensionality Reduction"
    rows={rows}
    loading={false}
    error={undefined}
    syncedTableProps={syncedTableProps}
  />
);

export default WGBSDimensionalityTable;
