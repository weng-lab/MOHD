import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";
import { UseATACDataReturn } from "@/common/hooks/omeHooks/useATACData";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";

type ATACMetadata =
    NonNullable<UseATACDataReturn["data"]>;

type DownloadRow = ATACMetadata[number] & DownloadFile;

type ATACDownloadsProps = {
    rows: ATACMetadata;
    ATACData: UseATACDataReturn;
    files: DownloadFile[];
    loadingFiles: boolean;
}

const ATACDownloadsTable = ({
    rows,
    ATACData,
    files,
    loadingFiles,
}: ATACDownloadsProps) => {

    const { loading, error } = ATACData;

    const buildATACRows = (
        rows: ATACMetadata[number][]
    ): DownloadRow[] => {
        return rows.flatMap((sample) =>
            files
                .filter((file) => file.sample_id === sample.sample_id)
                .map((file) => ({
                    ...sample,
                    ...file,
                }))
        );
    };

    return (
        <OmeDownloadTable
            label="Download ATAC-seq Data"
            rows={rows}
            loading={loading || loadingFiles}
            error={error}
            buildRows={buildATACRows}
            ome="ATAC-seq"
        />
    );
}

export default ATACDownloadsTable;