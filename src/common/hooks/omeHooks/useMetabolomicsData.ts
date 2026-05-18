import { gql } from "@/common/types/generated/gql";
import { FetchMetabolomicsMetadataQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_METABOLOMICS_DATA = gql(`
query fetchMetabolomicsMetadata {
  metabolomics_metadata {
    kit
    sample_id
    sex
    site
    status
  }
}
 `);

export type UseMetabolomicsDataParams = {
  skip?: boolean
};

export type UseMetabolomicsDataReturn = {
  data: FetchMetabolomicsMetadataQuery["metabolomics_metadata"] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

export const useMetabolomicsData = ({ skip }: UseMetabolomicsDataParams): UseMetabolomicsDataReturn => {
  const { data, loading, error } = useQuery(GET_METABOLOMICS_DATA, {
    skip: skip,
  });

  return {
    data: data?.metabolomics_metadata,
    loading,
    error,
  };
};
