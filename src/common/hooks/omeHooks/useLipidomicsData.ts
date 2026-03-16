import { gql } from "@/common/types/generated/gql";
import { FetchLipidomicsMetadataQuery } from "@/common/types/generated/graphql";
import { ApolloError, useQuery } from "@apollo/client";

const GET_LIPIDOMICS_DATA = gql(`
query fetchLipidomicsMetadata {
  lipidomics_metadata {
    kit
    sample_id
    sex
    site
    status
  }
}
 `);

export type UseLipidomicsDataParams = {
  skip?: boolean
};

export type UseLipidomicsDataReturn = {
  data: FetchLipidomicsMetadataQuery["lipidomics_metadata"] | undefined;
  loading: boolean;
  error: ApolloError | undefined;
};

export const useLipidomicsData = ({ skip }: UseLipidomicsDataParams): UseLipidomicsDataReturn => {
  const { data, loading, error } = useQuery(GET_LIPIDOMICS_DATA, {
    skip: skip,
  });

  return {
    data: data?.lipidomics_metadata,
    loading,
    error,
  };
};
