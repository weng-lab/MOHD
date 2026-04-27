import { gql } from "@/common/types/generated/gql";
import { FetchExposomicsMetadataQuery } from "@/common/types/generated/graphql";
import { useQuery } from "@apollo/client/react";

const GET_EXPOSOMICS_DATA = gql(`
query fetchExposomicsMetadata {
  exposomics_metadata {
    kit
    sample_id
    sex
    site
    status
  }
}
 `);

export type UseExposomicsDataParams = {
  skip?: boolean
};

export type UseExposomicsDataReturn = {
  data: FetchExposomicsMetadataQuery["exposomics_metadata"] | undefined;
  loading: boolean;
  error: Error | undefined;
};

export const useExposomicsData = ({ skip }: UseExposomicsDataParams): UseExposomicsDataReturn => {
  const { data, loading, error } = useQuery(GET_EXPOSOMICS_DATA, {
    skip: skip,
  });

  return {
    data: data?.exposomics_metadata,
    loading,
    error,
  };
};
