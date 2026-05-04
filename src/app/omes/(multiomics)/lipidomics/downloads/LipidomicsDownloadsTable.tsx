import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";
import { UseLipidomicsDataReturn } from "@/common/hooks/omeHooks/useLipidomicsData";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";

type LipidomicsMetadata =
    NonNullable<UseLipidomicsDataReturn["data"]>;

type LipidomicsDownloadsProps = {
    rows: LipidomicsMetadata;
    LipidomicsData: UseLipidomicsDataReturn;
    files: DownloadFile[];
    loadingFiles: boolean;
}

type DownloadRow = LipidomicsMetadata[number] & Omit<DownloadFile, "__typename">;

const LipidomicsDownloadsTable = ({
    rows,
    LipidomicsData,
    files,
    loadingFiles,
}: LipidomicsDownloadsProps) => {

    const { loading, error } = LipidomicsData;

    const buildLipidomicsRows = (
        rows: LipidomicsMetadata[number][]
    ): DownloadRow[] => {
        return rows.flatMap((sample) =>
            files
                .filter((file) => file.sample_id === sample.sample_id)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .map(({ __typename, ...file }) => ({
                    ...sample,
                    ...file,
                }))
        );
    };

    return (
        <OmeDownloadTable
            label="Download Lipidomics Data"
            rows={rows}
            loading={loading || loadingFiles}
            error={error}
            buildRows={buildLipidomicsRows}
            ome="Lipidomics"
        />
    );
}

export default LipidomicsDownloadsTable;