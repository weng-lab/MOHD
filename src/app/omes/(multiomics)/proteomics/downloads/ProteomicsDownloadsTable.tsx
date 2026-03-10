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

type ProteomicsDownloadsProps = {
    rows: RNAMetadata;
    RNAData: UseRNADataReturn;
}

const ProteomicsDownloadsTable = ({
    rows,
    RNAData,
}: ProteomicsDownloadsProps) => {

    const { loading, error } = RNAData;

    const buildProteomicsRows = (
        rows: RNAMetadata[number][]
    ): DownloadRow[] => {
        return rows.flatMap((sample) =>
            Config.Downloads.Proteomics.map((download) => ({
                ...sample,
                sample_id: sample.sample_id.replace("ER", "EP"),
                file_type: download.type,
                filename: download.filename.replace(
                    "[sample_id]",
                    sample.sample_id.replace("ER", "EP")
                ),
                anvil_download: download.anvil_download
            }))
        );
    };

    return (
        <OmeDownloadTable
            label="Download Proteomics Data"
            rows={rows}
            loading={loading}
            error={error}
            buildRows={buildProteomicsRows}
            ome="Proteomics"
        />
    );
}

export default ProteomicsDownloadsTable;