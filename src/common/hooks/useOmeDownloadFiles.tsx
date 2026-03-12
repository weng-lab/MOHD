import { gql, useQuery } from "@apollo/client";

export const FETCH_DOWNLOAD_FILES = gql`
    query FetchDownloadFiles($ome: OmeEnum!) {
        fetch_download_files(ome: $ome) {
            filename
            file_type
            size
            file_ome
            sample_id
            open_access
        }
    }
`;

export type DownloadFile = {
    filename: string;
    file_type: string;
    size: number;
    file_ome: string;
    sample_id: string;
    open_access: boolean;
};

type FetchDownloadFilesData = {
    fetch_download_files: DownloadFile[];
};

type FetchDownloadFilesProps = {
    ome: string;
};

export function useOmeDownloadFiles(ome: FetchDownloadFilesProps["ome"]) {
    const { data, loading, error } = useQuery<
        FetchDownloadFilesData,
        FetchDownloadFilesProps
    >(FETCH_DOWNLOAD_FILES, {
        variables: { ome },
    });

    return {
        data: data?.fetch_download_files ?? [],
        loading,
        error,
    };
}