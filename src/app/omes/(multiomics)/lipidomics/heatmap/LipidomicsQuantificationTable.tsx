import { Table, TableColDef, useSyncedTable } from "@weng-lab/ui-components";
import { GridSortModel } from "@mui/x-data-grid-premium";
import { SharedLipidomicsProps } from "./page";
import { LipidomicsSample } from "@/common/hooks/omeHooks/useLipidomicsData";
import { useMemo } from "react";
import { Typography } from "@mui/material";

const LipidomicsQuantificationTable = ({
    rows,
    lipidomicsData,
    tableProps,
}: SharedLipidomicsProps) => {
    const { loading, error } = lipidomicsData;
    const columns: TableColDef<LipidomicsSample>[] = [
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
            label={<Typography noWrap>Lipidomics Quantification</Typography>}
            rows={rows}
            loading={loading}
            error={!!error}
        />
    );
}

export default LipidomicsQuantificationTable;
