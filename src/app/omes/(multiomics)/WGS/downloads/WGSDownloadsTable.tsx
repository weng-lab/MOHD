import { WGSDownloadsProps, RNAMetadata } from "./page";
import Config from "@/common/config.json";
import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";

type DownloadRow = RNAMetadata[number] & {
    file_type: string;
    filename: string;
    anvil_download: boolean;
    url?: string;
};

const WGSDownloadsTable = ({
    rows,
    RNAData,
}: WGSDownloadsProps) => {

    const { loading, error } = RNAData;

    const buildWGSRows = (
        rows: RNAMetadata[number][]
    ): DownloadRow[] => {
        return rows.flatMap((sample) =>
            Config.Downloads.WGS.map((download) => ({
                ...sample,
                sample_id: sample.sample_id.replace("ER", "EG"),
                file_type: download.type,
                filename: download.filename.replace(
                    "[sample_id]",
                    sample.sample_id.replace("ER", "EG")
                ),
                anvil_download: download.anvil_download,
            }))
        );
    };

    return (
        <OmeDownloadTable
            label="Download WGS Data"
            rows={rows}
            loading={loading}
            error={error}
            buildRows={buildWGSRows}
            ome="WGS"
        />
    );
}

export default WGSDownloadsTable;