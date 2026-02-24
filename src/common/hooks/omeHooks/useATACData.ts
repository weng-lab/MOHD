import { gql } from "@/common/types/generated/gql";
import { FetchAtacMetadataQuery } from "@/common/types/generated/graphql";
import { ApolloError, useQuery } from "@apollo/client";

const GET_ATAC_DATA = gql(`
query fetchATACMetadata {
  atac_metadata {
    sample_id
    status
    site
    sex
    protocol
    umap_x
    umap_y
    opc_id
  }
}
 `);

export type UseATACDataParams = {
  skip?: boolean
};

export type UseATACDataReturn = {
  data: FetchAtacMetadataQuery["atac_metadata"] | undefined;
  loading: boolean;
  error: ApolloError | undefined;
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
