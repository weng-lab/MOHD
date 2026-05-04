import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";
import { UseExposomicsDataReturn } from "@/common/hooks/omeHooks/useExposomicsData";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";

type ExposomicsMetadata =
    NonNullable<UseExposomicsDataReturn["data"]>;

type DownloadRow = ExposomicsMetadata[number] & Omit<DownloadFile, "__typename">;

type ExposomicsDownloadsProps = {
    rows: ExposomicsMetadata;
    ExposomicsData: UseExposomicsDataReturn;
    files: DownloadFile[];
    loadingFiles: boolean;
}

const ExposomicsDownloadsTable = ({
    rows,
    ExposomicsData,
    files,
    loadingFiles,
}: ExposomicsDownloadsProps) => {

    const { loading, error } = ExposomicsData;

    const buildExposomicsRows = (
        rows: ExposomicsMetadata[number][]
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
            label="Download Exposomics Data"
            rows={rows}
            loading={loading || loadingFiles}
            error={error}
            buildRows={buildExposomicsRows}
            ome="Exposomics"
        />
    );
}

export default ExposomicsDownloadsTable;