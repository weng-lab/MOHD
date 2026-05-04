import { useQuery } from "@apollo/client/react";
import { gql } from "@/common/types/generated/gql";
import { OmeEnum } from "../types/generated/graphql";

export const FETCH_DOWNLOAD_FILES = gql(`
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
`);

export type DownloadFile = NonNullable<ReturnType<typeof useOmeDownloadFiles>["data"]>[number]

export function useOmeDownloadFiles(ome: OmeEnum) {
    const { data, loading, error } = useQuery(FETCH_DOWNLOAD_FILES, {
        variables: { ome },
    });

    //thanks ts strict mode
    if (data && data.fetch_download_files !== null && data.fetch_download_files !== undefined) {
      return {
        data: data.fetch_download_files.filter(x => x !== null),
        loading,
        error,
      };
    } else return {
        data: undefined,
        loading,
        error,
    }
}
