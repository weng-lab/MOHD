import { Table, TableColDef, useSyncedTable } from "@weng-lab/ui-components";
import { GridSortModel } from "@mui/x-data-grid-premium";
import { WGBSMetadata, SharedWGBSDimenionalityProps } from "./page";
import { useMemo } from "react";
import { Typography } from "@mui/material";

const WGBSDimensionalityTable = ({
    rows,
    WGBSData,
    tableProps,
}: SharedWGBSDimenionalityProps) => {
    const { loading, error } = WGBSData;
    const columns: TableColDef<WGBSMetadata[number]>[] = [
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
            label={<Typography noWrap>WGBS Dimensionality Reduction</Typography>}
            rows={rows}
            loading={loading}
            error={!!error}
        />
    );
}

export default WGBSDimensionalityTable;
