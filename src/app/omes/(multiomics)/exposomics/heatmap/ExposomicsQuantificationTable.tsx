import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedExposomicsProps } from "./page";

const ExposomicsQuantificationTable = ({
    rows,
    exposomicsData,
    tableProps,
    setAutoSort,
}: SharedExposomicsProps) => (
    <OmeQuantificationTable
        label="Exposomics Quantification"
        rows={rows}
        loading={exposomicsData.loading}
        error={exposomicsData.error}
        tableProps={tableProps}
        setAutoSort={setAutoSort}
    />
);

export default ExposomicsQuantificationTable;
