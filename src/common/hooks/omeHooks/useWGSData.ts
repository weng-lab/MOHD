import { gql } from "@/common/types/generated/gql";
import { FetchWgsMetadataQuery } from "@/common/types/generated/graphql";
import { ApolloError, useQuery } from "@apollo/client";

const GET_WGS_DATA = gql(`
query fetchWGSMetadata {
  wgs_metadata {
    sample_id
    sex
    site
    kit
    status
  }
}
 `);

export type UseWGSDataParams = {
  skip?: boolean
};

export type UseWGSDataReturn = {
  data: FetchWgsMetadataQuery["wgs_metadata"] | undefined;
  loading: boolean;
  error: ApolloError | undefined;
};

export const useWGSData = ({ skip }: UseWGSDataParams): UseWGSDataReturn => {
  const { data, loading, error } = useQuery(GET_WGS_DATA, {
    skip: skip,
  });

  return {
    data: data?.wgs_metadata,
    loading,
    error,
  };
};
