import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedLipidomicsProps } from "./page";

const LipidomicsQuantificationTable = ({ rows, lipidomicsData, syncedTableProps }: SharedLipidomicsProps) => (
  <OmeQuantificationTable
    label="Lipidomics Quantification"
    rows={rows}
    loading={lipidomicsData.loading}
    error={lipidomicsData.error}
    syncedTableProps={syncedTableProps}
  />
);

export default LipidomicsQuantificationTable;
