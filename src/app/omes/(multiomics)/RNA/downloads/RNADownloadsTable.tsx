import { GridColDef, GridGroupingColDefOverride, Table } from "@weng-lab/ui-components";
import { RNADownloadsProps, RNAMetadata } from "./page";
import { useMemo } from "react";
import { Button, IconButton} from "@mui/material";
import Config from "@/common/config.json";
import DownloadIcon from '@mui/icons-material/Download';

const groupingColDef: GridGroupingColDefOverride<RNAMetadata> = {
    leafField: "sample_id",
    headerName: "Dataset",
    maxWidth: 400,
    display: "flex",
} as const;

type DownloadRow = RNAMetadata[number] & {
    file_type: string;
    filename: string;
    anvil_download: boolean;
    url?: string;
};

const RNADownloadsTable = ({
    rows,
    RNAData,
}: RNADownloadsProps) => {

    const { loading, error } = RNAData;

    const expandedRows: DownloadRow[] = useMemo(() => {
        return rows.flatMap((sample) =>
            Config.Downloads.RNA.map((download) => ({
                ...sample,
                file_type: download.type,
                filename: download.filename.replace(
                    "[sample_id]",
                    sample.sample_id
                ),
                anvil_download: download.anvil_download,
                url: download.url?.replace(
                    "[sample_id]",
                    sample.sample_id
                ),
            }))
        );
    }, [rows]);

    const columns: GridColDef<DownloadRow>[] = [
        {
            field: "sample_id",
            headerName: "Dataset",
        },
        {
            field: "site",
            headerName: "Site",
            renderCell: (params) => {
                if (params.rowNode.type === "group") {
                    const firstChild = params.api.getRow(
                        params.rowNode.children[0]
                    ) as DownloadRow;

                    return firstChild.site;
                }

                return params.value;
            },
            type: "singleSelect",
            valueOptions: Array.from(new Set(rows.map((row) => row.site))),
        },
        {
            field: "status",
            headerName: "Status",
            renderCell: (params) => {
                if (params.rowNode.type === "group") {
                    const firstChild = params.api.getRow(
                        params.rowNode.children[0]
                    ) as DownloadRow;

                    return firstChild.status;
                }

                return params.value;
            },
            type: "singleSelect",
            valueOptions: Array.from(new Set(rows.map((row) => row.status))),
        },
        {
            field: "sex",
            headerName: "Sex",
            renderCell: (params) => {
                if (params.rowNode.type === "group") {
                    const firstChild = params.api.getRow(
                        params.rowNode.children[0]
                    ) as DownloadRow;

                    return firstChild.sex === "female" ? "F" : "M";
                }

                return params.value === "female" ? "F" : "M";
            },
            type: "singleSelect",
            valueOptions: Array.from(new Set(rows.map((row) => row.sex))),
        },
        {
            field: "file_type",
            headerName: "File Type",
        },
        {
            field: "filename",
            headerName: "Filename",
        },
        {
            field: "download",
            headerName: "Download",
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const { anvil_download, url } = params.row;

                if (anvil_download) {
                    return "AnVIL";
                }

                if (!url) return null;

                return (
                    <IconButton
                        component="a"
                        href={url}
                        download
                        color="primary"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DownloadIcon fontSize="medium" />
                    </IconButton>
                );
            },
        }
    ];

    const bulkDownloadToolbar = useMemo(() => {
        return (
            <Button
                variant="outlined"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                Bulk Download
            </Button>
        );
    }, []);

    return (
        <Table
            label={`Download RNA-seq Data`}
            rows={expandedRows}
            columns={columns}
            loading={loading}
            error={!!error}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
                rowGrouping: {
                    model: ["sample_id"],
                },
            }}
            divHeight={{ maxHeight: "800px" }}
            groupingColDef={groupingColDef}
            toolbarSlot={bulkDownloadToolbar}
        />
    );
}

export default RNADownloadsTable;