import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";
import { UseMetabolomicsDataReturn } from "@/common/hooks/omeHooks/useMetabolomicsData";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";

type MetabolomicsMetadata =
    NonNullable<UseMetabolomicsDataReturn["data"]>;

type DownloadRow = MetabolomicsMetadata[number] & Omit<DownloadFile, "__typename">;

type MetabolomicsDownloadsProps = {
    rows: MetabolomicsMetadata;
    MetabolomicsData: UseMetabolomicsDataReturn;
    files: DownloadFile[];
    loadingFiles: boolean;
}

const MetabolomicsDownloadsTable = ({
    rows,
    MetabolomicsData,
    files,
    loadingFiles,
}: MetabolomicsDownloadsProps) => {

    const { loading, error } = MetabolomicsData;

    const buildMetabolomicsRows = (
        rows: MetabolomicsMetadata[number][]
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
            label="Download Metabolomics Data"
            rows={rows}
            loading={loading || loadingFiles}
            error={error}
            buildRows={buildMetabolomicsRows}
            ome="Metabolomics"
        />
    );
}

export default MetabolomicsDownloadsTable;