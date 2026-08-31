import { Table, TableColDef, useSyncedTable } from "@weng-lab/ui-components";
import { GridSortModel } from "@mui/x-data-grid-premium";
import { SharedMetabolomicsProps } from "./page";
import { MetabolomicsSample } from "@/common/hooks/omeHooks/useMetabolomicsData";
import { useEffect, useMemo } from "react";
import { Typography } from "@mui/material";

const MetabolomicsQuantificationTable = ({
    rows,
    metabolomicsData,
    tableProps,
    setAutoSort,
}: SharedMetabolomicsProps) => {
    const { loading, error } = metabolomicsData;
    const columns: TableColDef<MetabolomicsSample>[] = [
        {
            field: "sample_id",
            headerName: "Dataset",
        },
        {
            field: "site",
            headerName: "Site",
            renderCell: (params) => params.value || "Control",
            type: "singleSelect",
            valueOptions: Array.from(new Set(rows.map((row) => row.site))).map((site) => ({
                value: site,
                label: site || "Control",
            })),
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
            renderCell: (params) => {
                if (params.value === "female") return "F";
                if (params.value === "male") return "M";
                return "Control";
            },
            type: "singleSelect",
            valueOptions: Array.from(new Set(rows.map((row) => row.sex))).map((sex) => ({
                value: sex,
                label: sex === "female" ? "F" : sex === "male" ? "M" : "Control",
            })),
        },
    ];
    const initialSort: GridSortModel = useMemo(() => [{ field: "sample_id", sort: "asc" }], []);
    const { syncedTableProps, autoSort } = useSyncedTable({
        tableProps,
        columns,
        initialSort,
        isPresorted: false,
    });

    useEffect(() => {
        setAutoSort(autoSort);
    }, [autoSort, setAutoSort]);

    return (
        <Table
            {...syncedTableProps}
            label={<Typography noWrap>Metabolomics Quantification</Typography>}
            rows={rows}
            loading={loading}
            error={!!error}
        />
    );
}

export default MetabolomicsQuantificationTable;
