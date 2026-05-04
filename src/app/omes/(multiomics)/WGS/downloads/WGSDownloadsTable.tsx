import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";
import { UseWGSDataReturn } from "@/common/hooks/omeHooks/useWGSData";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";

type WGSMetadata =
    NonNullable<UseWGSDataReturn["data"]>;

type DownloadRow = WGSMetadata[number] & Omit<DownloadFile, "__typename">;

type WGSDownloadsProps = {
    rows: WGSMetadata;
    WGSData: UseWGSDataReturn;
    files: DownloadFile[];
    loadingFiles: boolean;
}

const WGSDownloadsTable = ({
    rows,
    WGSData,
    files,
    loadingFiles,
}: WGSDownloadsProps) => {

    const { loading, error } = WGSData;

    const buildWGSRows = (
        rows: WGSMetadata[number][]
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
            label="Download WGS Data"
            rows={rows}
            loading={loading || loadingFiles}
            error={error}
            buildRows={buildWGSRows}
            ome="WGS"
        />
    );
}

export default WGSDownloadsTable;