import { MetabolomicsDownloadsProps, RNAMetadata } from "./page";
import Config from "@/common/config.json";
import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";

type DownloadRow = RNAMetadata[number] & {
    file_type: string;
    filename: string;
    anvil_download: boolean;
    url?: string;
};

const MetabolomicsDownloadsTable = ({
    rows,
    RNAData,
}: MetabolomicsDownloadsProps) => {

    const { loading, error } = RNAData;

    const buildMetabolomicsRows = (
        rows: RNAMetadata[number][]
    ): DownloadRow[] => {
        return rows.flatMap((sample) =>
            Config.Downloads.Metabolomics.map((download) => ({
                ...sample,
                sample_id: sample.sample_id.replace("ER", "EM"),
                file_type: download.type,
                filename: download.filename.replace(
                    "[sample_id]",
                    sample.sample_id.replace("ER", "EM")
                ),
                anvil_download: download.anvil_download
            }))
        );
    };

    return (
        <OmeDownloadTable
            label="Download Metabolomics Data"
            rows={rows}
            loading={loading}
            error={error}
            buildRows={buildMetabolomicsRows}
            ome="Metabolomics"
        />
    );
}

export default MetabolomicsDownloadsTable;