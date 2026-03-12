import { Button, IconButton, Tooltip } from "@mui/material";
import { GridColDef, GridGroupingColDefOverride, Table } from "@weng-lab/ui-components";
import { useMemo, useState } from "react";
import Image from "next/image";
import DownloadIcon from '@mui/icons-material/Download';
import { ApolloError } from "@apollo/client";
import BulkDownloadModal from "./BulkDownloadModal";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";

type BaseSample = {
    sample_id: string;
    site: string;
    status: string;
    sex: string;
    protocol?: string;
};

type DownloadRow<T> = T & DownloadFile;

type DownloadTableProps<T extends BaseSample> = {
    rows: T[];
    loading?: boolean;
    error?: ApolloError;
    buildRows: (rows: T[]) => DownloadRow<T>[];
    label: string;
    ome: string;
};

export function OmeDownloadTable<T extends BaseSample>({
    rows,
    loading,
    error,
    buildRows,
    label,
    ome,
}: DownloadTableProps<T>) {
    const [open, setOpen] = useState(false);
    const expandedRows = useMemo(() => buildRows(rows), [rows, buildRows]);

    const groupingColDef: GridGroupingColDefOverride<T> = {
        leafField: "sample_id",
        headerName: "Dataset",
        maxWidth: 400,
        display: "flex",
    } as const;

    const columns: GridColDef<DownloadRow<T>>[] = [
        { 
            field: "sample_id",
            headerName: "Dataset",
            renderCell: (params) => {
                if (params.rowNode.type === "group") {
                    const firstChild = params.api.getRow(
                        params.rowNode.children[0]
                    ) as DownloadRow<T>;

                    return firstChild.sample_id;
                }

                return null;
            }
        },
        {
            field: "site",
            headerName: "Site",
            renderCell: (params) => {
                if (params.rowNode.type === "group") {
                    const firstChild = params.api.getRow(
                        params.rowNode.children[0]
                    ) as DownloadRow<T>;

                    return firstChild.site;
                }

                return null;
            }
        },
        {
            field: "status",
            headerName: "Status",
            renderCell: (params) => {
                if (params.rowNode.type === "group") {
                    const firstChild = params.api.getRow(
                        params.rowNode.children[0]
                    ) as DownloadRow<T>;

                    return firstChild.status;
                }

                return null;
            },
        },
        {
            field: "sex",
            headerName: "Sex",
            renderCell: (params) => {
                if (params.rowNode.type === "group") {
                    const firstChild = params.api.getRow(
                        params.rowNode.children[0]
                    ) as DownloadRow<T>;

                    return firstChild.sex === "female" ? "F" : "M";
                }

                return null;
            },
        },
        ...(expandedRows.some((row) => row.protocol)
            ? [
                {
                    field: "protocol",
                    headerName: "Protocol",
                    renderCell: (params) => {
                        if (params.rowNode.type === "group") {
                            const firstChild = params.api.getRow(
                                params.rowNode.children[0]
                            ) as DownloadRow<T>;

                            return firstChild.protocol;
                        }

                        return null;
                    },
                } as GridColDef<DownloadRow<T>>,
            ]
            : []),
        { field: "file_type", headerName: "Description" },
        { field: "filename", headerName: "Filename" },
        {
            field: "size",
            headerName: "File Size",
            renderCell: (params) => {
                const bytes = params.value;
                if (!bytes) return "";

                const units = ["B", "KB", "MB", "GB", "TB"];
                let i = 0;
                let value = bytes;

                while (value >= 1024 && i < units.length - 1) {
                    value /= 1024;
                    i++;
                }

                return `${value.toFixed(1)} ${units[i]}`;
            },
        },
        {
            field: "download",
            headerName: "Download",
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                if (params.rowNode.type === "group") {
                    const children = params.rowNode.children ?? [];

                    const hasOpenAccess = children.some((id) => {
                        const row = params.api.getRow(id);
                        return row?.open_access;
                    });

                    if (!hasOpenAccess) return null;
                    return (
                        <Tooltip title="Download all open-access files for this dataset" placement="left" arrow>
                            <IconButton
                                color="primary"
                            >
                                <DownloadIcon fontSize="medium" />
                            </IconButton>
                        </Tooltip>
                    );
                }

                const { open_access, sample_id, filename } = params.row;
                const index = ome === "ATAC-seq" ? 2 : ome === "RNA-seq" ? 3 : 1;
                const url = `https://downloads.mohdconsortium.org/${index}_${ome.replace("-seq", "")}/${sample_id}/${filename}`;

                if (!open_access) {
                    return (
                        <IconButton
                            component="a"
                            href="https://anvilproject.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image
                                src="/logo-mark-Anvil.png"
                                alt="AnVIL"
                                width={28}
                                height={28}
                            />
                        </IconButton>
                    );
                }

                if (!url) return null;

                return (
                    <IconButton component="a" href={url} download color="primary">
                        <DownloadIcon />
                    </IconButton>
                );
            },
        },
    ];

    const bulkDownloadToolbar = useMemo(() => {
        return (
            <Tooltip title="Download all open-access files for all datasets" placement="left" arrow>
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen(true);
                    }}
                >
                    Bulk Download
                </Button>
            </Tooltip>
        );
    }, []);

    return (
        <>
            <Table
                label={label}
                rows={expandedRows}
                columns={columns}
                loading={loading}
                error={!!error}
                initialState={{
                    rowGrouping: { model: ["sample_id"] },
                }}
                divHeight={{ maxHeight: "650px" }}
                groupingColDef={groupingColDef}
                toolbarSlot={bulkDownloadToolbar}
            />
            <BulkDownloadModal open={open} onClose={() => setOpen(false)} ome={ome} />
        </>
    );
}