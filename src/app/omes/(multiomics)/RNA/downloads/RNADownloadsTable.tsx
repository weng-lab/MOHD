import Config from "@/common/config.json";
import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";
import { UseRNADataReturn } from "@/common/hooks/omeHooks/useRNAData";

type RNAMetadata =
    NonNullable<UseRNADataReturn["data"]>;

type DownloadRow = RNAMetadata[number] & {
    file_type: string;
    filename: string;
    anvil_download: boolean;
    url?: string;
};

type RNADownloadsProps = {
    rows: RNAMetadata;
    RNAData: UseRNADataReturn;
}

const RNADownloadsTable = ({
    rows,
    RNAData,
}: RNADownloadsProps) => {
    const { loading, error } = RNAData;

    const buildRNARows = (
        rows: RNAMetadata[number][]
    ): DownloadRow[] => {
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
    };

    return (
        <OmeDownloadTable
            label="Download RNA-seq Data"
            rows={rows}
            loading={loading}
            error={error}
            buildRows={buildRNARows}
            ome="RNA-seq"
        />
    );
}

export default RNADownloadsTable;