import { gql } from "@/common/types/generated/gql";
import { FetchProteomicsMetadataQuery } from "@/common/types/generated/graphql";
import { useQuery } from "@apollo/client/react";

const GET_PROTEMICS_DATA = gql(`
query fetchProteomicsMetadata {
  proteomics_metadata {
    kit
    sample_id
    sex
    site
    status
  }
}
 `);

export type UseProteomicsDataParams = {
  skip?: boolean
};

export type UseProteomicsDataReturn = {
  data: FetchProteomicsMetadataQuery["proteomics_metadata"] | undefined;
  loading: boolean;
  error: Error | undefined;
};

export const useProteomicsData = ({ skip }: UseProteomicsDataParams): UseProteomicsDataReturn => {
  const { data, loading, error } = useQuery(GET_PROTEMICS_DATA, {
    skip: skip,
  });

  return {
    data: data?.proteomics_metadata,
    loading,
    error,
  };
};
