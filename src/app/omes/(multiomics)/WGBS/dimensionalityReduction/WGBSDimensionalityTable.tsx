import { Table, TableColDef, useSyncedTable } from "@weng-lab/ui-components";
import { GridSortModel } from "@mui/x-data-grid-premium";
import { SharedWGBSDimenionalityProps } from "./WGBSDimensionalityReductionClient";
import type { WGBSRow } from "./types";
import { useMemo } from "react";
import { Typography } from "@mui/material";

const WGBSDimensionalityTable = ({
    rows,
    tableProps,
}: SharedWGBSDimenionalityProps) => {
    const columns: TableColDef<WGBSRow>[] = [
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
        />
    );
}

export default WGBSDimensionalityTable;
