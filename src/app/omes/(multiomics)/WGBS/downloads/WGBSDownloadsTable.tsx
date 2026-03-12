import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";
import { UseWGBSDataReturn } from "@/common/hooks/omeHooks/useWGBSData"
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";

type WGBSMetadata =
    NonNullable<UseWGBSDataReturn["data"]>;

type DownloadRow = WGBSMetadata[number] & DownloadFile;

type WGBSDownloadsProps = {
    rows: WGBSMetadata;
    WGBSData: UseWGBSDataReturn;
    files: DownloadFile[];
    loadingFiles: boolean;
}

const WGBSDownloadsTable = ({
    rows,
    WGBSData,
    files,
    loadingFiles,
}: WGBSDownloadsProps) => {

    const { loading, error } = WGBSData;

    const buildWGBSRows = (
        rows: WGBSMetadata[number][]
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
            label="Download WGBS Data"
            rows={rows}
            loading={loading || loadingFiles}
            error={error}
            buildRows={buildWGBSRows}
            ome="WGBS"
        />
    );
}

export default WGBSDownloadsTable;