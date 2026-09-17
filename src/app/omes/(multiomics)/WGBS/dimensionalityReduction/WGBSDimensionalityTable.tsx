import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedWGBSDimenionalityProps } from "./page";

const WGBSDimensionalityTable = ({ rows, WGBSData, syncedTableProps }: SharedWGBSDimenionalityProps) => (
  <OmeQuantificationTable
    label="WGBS Dimensionality Reduction"
    rows={rows}
    loading={WGBSData.loading}
    error={WGBSData.error}
    syncedTableProps={syncedTableProps}
  />
);

export default WGBSDimensionalityTable;
