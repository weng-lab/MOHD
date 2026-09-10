import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedExposomicsProps } from "./page";

const ExposomicsQuantificationTable = ({ rows, exposomicsData, syncedTableProps }: SharedExposomicsProps) => (
  <OmeQuantificationTable
    label="Exposomics Quantification"
    rows={rows}
    loading={exposomicsData.loading}
    error={exposomicsData.error}
    syncedTableProps={syncedTableProps}
  />
);

export default ExposomicsQuantificationTable;
