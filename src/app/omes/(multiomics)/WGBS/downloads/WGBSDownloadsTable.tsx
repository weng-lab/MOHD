import { WGBSDownloadsProps, RNAMetadata } from "./page";
import Config from "@/common/config.json";
import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";

type DownloadRow = RNAMetadata[number] & {
    file_type: string;
    filename: string;
    anvil_download: boolean;
    url?: string;
};

const WGBSDownloadsTable = ({
    rows,
    RNAData,
}: WGBSDownloadsProps) => {

    const { loading, error } = RNAData;

    const buildWGBSRows = (
        rows: RNAMetadata[number][]
    ): DownloadRow[] => {
        return rows.flatMap((sample) =>
            Config.Downloads.WGBS.map((download) => ({
                ...sample,
                sample_id: sample.sample_id.replace("ER", "EG"),
                file_type: download.type,
                filename: download.filename.replace(
                    "[sample_id]",
                    sample.sample_id.replace("ER", "EG")
                ),
                anvil_download: download.anvil_download,
                url: download.url?.replace(
                    "[sample_id]",
                    sample.sample_id.replace("ER", "EG")
                ),
            }))
        );
    };

    return (
        <OmeDownloadTable
            label="Download WGBS Data"
            rows={rows}
            loading={loading}
            error={error}
            buildRows={buildWGBSRows}
            ome="WGBS"
        />
    );
}

export default WGBSDownloadsTable;