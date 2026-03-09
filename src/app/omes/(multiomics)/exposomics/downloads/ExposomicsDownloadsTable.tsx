import { ExposomicsDownloadsProps, RNAMetadata } from "./page";
import Config from "@/common/config.json";
import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";

type DownloadRow = RNAMetadata[number] & {
    file_type: string;
    filename: string;
    anvil_download: boolean;
    url?: string;
};

const ExposomicsDownloadsTable = ({
    rows,
    RNAData,
}: ExposomicsDownloadsProps) => {

    const { loading, error } = RNAData;

    const buildExposomicsRows = (
        rows: RNAMetadata[number][]
    ): DownloadRow[] => {
        return rows.flatMap((sample) =>
            Config.Downloads.Exposomics.map((download) => ({
                ...sample,
                sample_id: sample.sample_id.replace("ER", "EE"),
                file_type: download.type,
                filename: download.filename.replace(
                    "[sample_id]",
                    sample.sample_id.replace("ER", "EE")
                ),
                anvil_download: download.anvil_download
            }))
        );
    };

    return (
        <OmeDownloadTable
            label="Download Exposomics Data"
            rows={rows}
            loading={loading}
            error={error}
            buildRows={buildExposomicsRows}
            ome="Exposomics"
        />
    );
}

export default ExposomicsDownloadsTable;