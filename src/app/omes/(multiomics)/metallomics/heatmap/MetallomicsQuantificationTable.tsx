import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedMetallomicsProps } from "./page";

const MetallomicsQuantificationTable = ({ rows, metallomicsData, syncedTableProps }: SharedMetallomicsProps) => (
  <OmeQuantificationTable
    label="Metallomics Quantification"
    rows={rows}
    loading={metallomicsData.loading}
    error={metallomicsData.error}
    syncedTableProps={syncedTableProps}
  />
);

export default MetallomicsQuantificationTable;
