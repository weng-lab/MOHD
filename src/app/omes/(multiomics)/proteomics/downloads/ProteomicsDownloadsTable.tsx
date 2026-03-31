import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";
import { UseProteomicsDataReturn } from "@/common/hooks/omeHooks/useProteomicsData";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";

type ProteomicsMetadata =
    NonNullable<UseProteomicsDataReturn["data"]>;

type DownloadRow = ProteomicsMetadata[number] & Omit<DownloadFile, "__typename">;

type ProteomicsDownloadsProps = {
    rows: ProteomicsMetadata;
    ProteomicsData: UseProteomicsDataReturn;
    files: DownloadFile[];
    loadingFiles: boolean;
}

const ProteomicsDownloadsTable = ({
    rows,
    ProteomicsData,
    files,
    loadingFiles,
}: ProteomicsDownloadsProps) => {

    const { loading, error } = ProteomicsData;

    const buildProteomicsRows = (
        rows: ProteomicsMetadata[number][]
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
            label="Download Proteomics Data"
            rows={rows}
            loading={loading || loadingFiles}
            error={!!error}
            buildRows={buildProteomicsRows}
            ome="Proteomics"
        />
    );
}

export default ProteomicsDownloadsTable;