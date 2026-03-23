import { Table, TableColDef, useSyncedTable } from "@weng-lab/ui-components";
import { GridSortModel } from "@mui/x-data-grid-premium";
import { ATACMetadata, SharedATACDimenionalityProps } from "./page";
import { useMemo } from "react";

const ATACDimensionalityTable = ({
    rows,
    ATACData,
    tableProps,
}: SharedATACDimenionalityProps) => {
    const { loading, error } = ATACData;
    const columns: TableColDef<ATACMetadata[number]>[] = [
        {
            field: "sample_id",
            headerName: "Dataset",
        },
        {
            field: "site",
            headerName: "Site",
            type: "singleSelect",
            valueOptions: Array.from(new Set(rows.map((row) => row.site))),
        },
        {
            field: "status",
            headerName: "Status",
            type: "singleSelect",
            valueOptions: Array.from(new Set(rows.map((row) => row.status))),
        },
        {
            field: "sex",
            headerName: "Sex",
            renderCell: (params) => (params.value === "female" ? "F" : "M"),
            type: "singleSelect",
            valueOptions: Array.from(new Set(rows.map((row) => row.sex))),
        },
        {
            field: "protocol",
            headerName: "Protocol",
            renderCell: (params) => (params.value.replaceAll(" method", "")),
            type: "singleSelect",
            valueOptions: Array.from(new Set(rows.map((row) => row.protocol))),
        }
    ];
    const initialSort: GridSortModel = useMemo(() => [{ field: "sample_id", sort: "asc" }], []);
    const { syncedTableProps } = useSyncedTable({
        tableProps,
        columns,
        initialSort,
        isPresorted: false,
    });

    return (
        <Table
            {...syncedTableProps}
            label={`ATAC-seq Dimensionality Reduction`}
            rows={rows}
            loading={loading}
            error={!!error}
        />
    );
}

export default ATACDimensionalityTable;
