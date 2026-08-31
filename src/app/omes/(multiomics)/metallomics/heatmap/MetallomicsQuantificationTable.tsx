import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedMetallomicsProps } from "./page";

const MetallomicsQuantificationTable = ({
    rows,
    metallomicsData,
    tableProps,
    setAutoSort,
}: SharedMetallomicsProps) => (
    <OmeQuantificationTable
        label="Metallomics Quantification"
        rows={rows}
        loading={metallomicsData.loading}
        error={metallomicsData.error}
        tableProps={tableProps}
        setAutoSort={setAutoSort}
    />
);

export default MetallomicsQuantificationTable;
