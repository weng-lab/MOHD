import { gql } from "@/common/types/generated/gql";
import { FetchAtacMetadataQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_ATAC_DATA = gql(`
query fetchATACMetadata {
  atac_metadata {
    kit
    protocol
    sample_id
    sex
    site
    status
    pc1
    pc2
    pc3
    pc4
    pc5
    pc6
    pc7
    pc8
    pc9
    pc10
    umap_x
    umap_y
  }
}
 `);

export type UseATACDataParams = {
  skip?: boolean;
};

export type UseATACDataReturn = {
  data: FetchAtacMetadataQuery["atac_metadata"] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

export const useATACData = ({ skip }: UseATACDataParams): UseATACDataReturn => {
  const { data, loading, error } = useQuery(GET_ATAC_DATA, {
    skip: skip,
  });

  return {
    data: data?.atac_metadata,
    loading,
    error,
  };
};
