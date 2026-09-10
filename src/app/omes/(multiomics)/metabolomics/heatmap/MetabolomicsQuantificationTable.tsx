import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedMetabolomicsProps } from "./page";

const MetabolomicsQuantificationTable = ({ rows, metabolomicsData, syncedTableProps }: SharedMetabolomicsProps) => (
  <OmeQuantificationTable
    label="Metabolomics Quantification"
    rows={rows}
    loading={metabolomicsData.loading}
    error={metabolomicsData.error}
    syncedTableProps={syncedTableProps}
  />
);

export default MetabolomicsQuantificationTable;
