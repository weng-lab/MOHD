import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";
import { UseRNADataReturn } from "@/common/hooks/omeHooks/useRNAData";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";

type RNAMetadata =
    NonNullable<UseRNADataReturn["data"]>;

type DownloadRow = RNAMetadata[number] & DownloadFile;

type RNADownloadsProps = {
    rows: RNAMetadata;
    RNAData: UseRNADataReturn;
    files: DownloadFile[];
    loadingFiles: boolean;
}

const RNADownloadsTable = ({
    rows,
    RNAData,
    files,
    loadingFiles,
}: RNADownloadsProps) => {
    const { loading, error } = RNAData;

    const buildRNARows = (
        rows: RNAMetadata[number][]
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
            label="Download RNA-seq Data"
            rows={rows}
            loading={loading || loadingFiles}
            error={error}
            buildRows={buildRNARows}
            ome="RNA-seq"
        />
    );
}

export default RNADownloadsTable;