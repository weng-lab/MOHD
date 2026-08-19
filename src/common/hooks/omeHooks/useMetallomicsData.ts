import { gql } from "@/common/types/generated/gql";
import { FetchMetallomicsDataQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_METALLOMICS_DATA = gql(`
query fetchMetallomicsData {
  metallomics_quantification {
    sample_id
    site
    status
    sex
    quantification { metal value }
  }
}
 `);

export type UseMetallomicsDataParams = {
  skip?: boolean
};

export type UseMetallomicsDataReturn = {
  data: FetchMetallomicsDataQuery["metallomics_quantification"] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

export const useMetallomicsData = ({ skip }: UseMetallomicsDataParams): UseMetallomicsDataReturn => {
  const { data, loading, error } = useQuery(GET_METALLOMICS_DATA, {
    skip: skip,
  });

  return {
    data: data?.metallomics_quantification,
    loading,
    error,
  };
};
