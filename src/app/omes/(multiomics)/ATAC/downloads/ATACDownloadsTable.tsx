import { ATACDownloadsProps, ATACMetadata } from "./page";
import Config from "@/common/config.json";
import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";

type DownloadRow = ATACMetadata[number] & {
    file_type: string;
    filename: string;
    anvil_download: boolean;
    url?: string;
};

const ATACDownloadsTable = ({
    rows,
    ATACData,
}: ATACDownloadsProps) => {

    const { loading, error } = ATACData;

    const buildATACRows = (
        rows: ATACMetadata[number][]
    ): DownloadRow[] => {
        return rows.flatMap((sample) =>
            Config.Downloads.ATAC.map((download) => ({
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
    };

    return (
        <OmeDownloadTable
            label="Download ATAC-seq Data"
            rows={rows}
            loading={loading}
            error={error}
            buildRows={buildATACRows}
            ome="ATAC-seq"
        />
    );
}

export default ATACDownloadsTable;