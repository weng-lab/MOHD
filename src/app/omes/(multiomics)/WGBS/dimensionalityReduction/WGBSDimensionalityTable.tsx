import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedWGBSDimenionalityProps } from "./WGBSDimensionalityReductionClient";

const WGBSDimensionalityTable = ({ rows, tableProps, setAutoSort }: SharedWGBSDimenionalityProps) => (
  <OmeQuantificationTable
    label="WGBS Dimensionality Reduction"
    rows={rows}
    loading={false}
    error={undefined}
    tableProps={tableProps}
    setAutoSort={setAutoSort}
  />
);

export default WGBSDimensionalityTable;
