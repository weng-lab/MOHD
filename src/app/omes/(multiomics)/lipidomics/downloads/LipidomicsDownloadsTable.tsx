import { LipidomicsDownloadsProps, RNAMetadata } from "./page";
import Config from "@/common/config.json";
import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";

type DownloadRow = RNAMetadata[number] & {
    file_type: string;
    filename: string;
    anvil_download: boolean;
    url?: string;
};

const LipidomicsDownloadsTable = ({
    rows,
    RNAData,
}: LipidomicsDownloadsProps) => {

    const { loading, error } = RNAData;

    const buildLipidomicsRows = (
        rows: RNAMetadata[number][]
    ): DownloadRow[] => {
        return rows.flatMap((sample) =>
            Config.Downloads.Lipidomics.map((download) => ({
                ...sample,
                sample_id: sample.sample_id.replace("ER", "EL"),
                file_type: download.type,
                filename: download.filename.replace(
                    "[sample_id]",
                    sample.sample_id.replace("ER", "EL")
                ),
                anvil_download: download.anvil_download
            }))
        );
    };

    return (
        <OmeDownloadTable
            label="Download Lipidomics Data"
            rows={rows}
            loading={loading}
            error={error}
            buildRows={buildLipidomicsRows}
            ome="Lipidomics"
        />
    );
}

export default LipidomicsDownloadsTable;