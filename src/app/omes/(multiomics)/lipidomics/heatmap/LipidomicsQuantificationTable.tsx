import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedLipidomicsProps } from "./page";

const LipidomicsQuantificationTable = ({
    rows,
    lipidomicsData,
    tableProps,
    setAutoSort,
}: SharedLipidomicsProps) => (
    <OmeQuantificationTable
        label="Lipidomics Quantification"
        rows={rows}
        loading={lipidomicsData.loading}
        error={lipidomicsData.error}
        tableProps={tableProps}
        setAutoSort={setAutoSort}
    />
);

export default LipidomicsQuantificationTable;
