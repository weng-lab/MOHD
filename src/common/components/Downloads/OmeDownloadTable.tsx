import { Button, IconButton, Tooltip } from "@mui/material";
import { GridColDef, GridGroupingColDefOverride, Table } from "@weng-lab/ui-components";
import { useMemo, useState } from "react";
import Image from "next/image";
import DownloadIcon from '@mui/icons-material/Download';
import { ApolloError } from "@apollo/client";
import BulkDownloadModal from "./BulkDownloadModal";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";
import { formatBytes } from "@/common/downloads";
import { DownloadToolbar, DownloadToolbarProvider } from "./OmeDownloadToolbar";

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
    compressedFiles?: DownloadFile[];
};

export function OmeDownloadTable<T extends BaseSample>({
    rows,
    loading,
    error,
    buildRows,
    label,
    ome,
    compressedFiles = [],
}: DownloadTableProps<T>) {
    const [open, setOpen] = useState(false);
    //build rows and filter out compressed files
    const expandedRows = useMemo(() => {
        const compressedNames = new Set(
            compressedFiles?.map((f) => f.filename) ?? []
        );

        return buildRows(rows).filter(
            (row) => !compressedNames.has(row.filename)
        );
    }, [rows, buildRows, compressedFiles]);

    const allDatasetsCompressedFile = useMemo(() => {
        return compressedFiles.find((file) => file.filename.split("_")[1] === "all");
    }, [compressedFiles]);

    const groupingColDef: GridGroupingColDefOverride<T> = {
        leafField: "sample_id",
        headerName: "Dataset",
        maxWidth: 400,
        display: "flex",
    } as const;

    const compressedMap = useMemo(() => {
        return new Map(
            compressedFiles.map((f) => [f.sample_id, f])
        );
    }, [compressedFiles]);

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
        {
            field: "file_type",
            headerName: "Description",
            renderCell: (params) => {
                if (params.rowNode.type === "group") {
                    const firstChild = params.api.getRow(
                        params.rowNode.children[0]
                    ) as DownloadRow<T>;

                    const compressed = compressedMap.get(firstChild.sample_id);
                    return compressed?.file_type ?? null;
                }

                const compressed = compressedMap.get(params.row.sample_id);
                if (compressed?.filename === params.row.filename) return null;

                return params.value;
            },
        },
        {
            field: "filename",
            headerName: "Filename",
            renderCell: (params) => {
                if (params.rowNode.type === "group") {
                    const firstChild = params.api.getRow(
                        params.rowNode.children[0]
                    ) as DownloadRow<T>;

                    const compressed = compressedMap.get(firstChild.sample_id);
                    return compressed?.filename ?? null;
                }

                const compressed = compressedMap.get(params.row.sample_id);
                if (compressed?.filename === params.row.filename) return null;

                return params.value;
            },
        },
        {
            field: "size",
            headerName: "File Size",
            renderCell: (params) => {
                if (params.rowNode.type === "group") {
                    const firstChild = params.api.getRow(
                        params.rowNode.children[0]
                    ) as DownloadRow<T>;

                    const compressed = compressedMap.get(firstChild.sample_id);
                    return compressed ? formatBytes(compressed.size) : null;
                }

                const compressed = compressedMap.get(params.row.sample_id);
                if (compressed?.filename === params.row.filename) return null;

                return formatBytes(params.value);
            },
        },
        {
            field: "download",
            headerName: "Download",
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const index = ome === "ATAC-seq" ? 2 : ome === "RNA-seq" ? 3 : 1;

                if (params.rowNode.type === "group") {
                    const children = params.rowNode.children ?? [];

                    const hasOpenAccess = children.some((id) => {
                        const row = params.api.getRow(id);
                        return row?.open_access;
                    });

                    if (!hasOpenAccess) return null;

                    const firstChild = params.api.getRow(
                        params.rowNode.children[0]
                    ) as DownloadRow<T>;

                    const compressedFile = compressedMap.get(firstChild.sample_id);
                    const compressedUrl = compressedFile ? `https://downloads.mohdconsortium.org/${index}_${ome.replace("-seq", "")}/${compressedFile.sample_id}/${compressedFile.filename}` : "";

                    return (
                        <Tooltip title="Download all open-access files for this dataset" placement="left" arrow>
                            <IconButton color="primary" component="a" href={compressedUrl} download disabled={compressedUrl === ""}>
                                <DownloadIcon fontSize="medium" />
                            </IconButton>
                        </Tooltip>
                    );
                }

                const { open_access, sample_id, filename } = params.row;
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
            <Tooltip
                title={
                    compressedFiles.length === 0
                        ? "No open-access datasets available to download"
                        : "Download all open-access files for all datasets"
                }
                placement="left"
                arrow
            >
                <span>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(true);
                        }}
                        disabled={compressedFiles.length === 0}
                    >
                        Bulk Download
                    </Button>
                </span>
            </Tooltip>
        );
    }, [compressedFiles]);

    return (
        <>
            <DownloadToolbarProvider label={label} toolbarSlot={bulkDownloadToolbar}>
                <Table
                    label={label}
                    rows={expandedRows}
                    columns={columns}
                    loading={loading}
                    error={!!error}
                    disableColumnFilter
                    disableColumnSelector
                    disableColumnMenu
                    disableDensitySelector
                    initialState={{
                        rowGrouping: { model: ["sample_id"] },
                        sorting: { sortModel: [{ field: "file_type", sort: "asc" }] },
                    }}
                    slots={{ toolbar: DownloadToolbar }}
                    divHeight={{ maxHeight: "650px" }}
                    groupingColDef={groupingColDef}
                />
            </DownloadToolbarProvider>
            <BulkDownloadModal
                open={open}
                onClose={() => setOpen(false)}
                ome={ome}
                allDatasetsCompressedFile={allDatasetsCompressedFile}
            />
        </>
    );
}
