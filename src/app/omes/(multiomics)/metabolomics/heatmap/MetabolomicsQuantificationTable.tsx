import OmeQuantificationTable from "@/common/components/OmeQuantification/OmeQuantificationTable";
import { SharedMetabolomicsProps } from "./page";

const MetabolomicsQuantificationTable = ({
    rows,
    metabolomicsData,
    tableProps,
    setAutoSort,
}: SharedMetabolomicsProps) => (
    <OmeQuantificationTable
        label="Metabolomics Quantification"
        rows={rows}
        loading={metabolomicsData.loading}
        error={metabolomicsData.error}
        tableProps={tableProps}
        setAutoSort={setAutoSort}
    />
);

export default MetabolomicsQuantificationTable;
