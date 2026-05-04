import { OmeDownloadTable } from "@/common/components/Downloads/OmeDownloadTable";
import { UseRNADataReturn } from "@/common/hooks/omeHooks/useRNAData";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";
import { useMemo } from "react";

type RNAMetadata =
    NonNullable<UseRNADataReturn["data"]>;

type DownloadRow = RNAMetadata[number] & Omit<DownloadFile, "__typename">;

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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .map(({ __typename, ...file }) => ({
                    ...sample,
                    ...file,
                }))
        );
    };

    const compressedFiles = useMemo(() => {
        return files.filter((file) => file.file_type === "Compressed Tar File");
    }, [files]);

    return (
        <OmeDownloadTable
            label="Download RNA-seq Data"
            rows={rows}
            loading={loading || loadingFiles}
            error={error}
            buildRows={buildRNARows}
            ome="RNA-seq"
            compressedFiles={compressedFiles}
        />
    );
}

export default RNADownloadsTable;