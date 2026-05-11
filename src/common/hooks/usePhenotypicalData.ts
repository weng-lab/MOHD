import { gql } from "@/common/types/generated/gql";
import { Fetch_Phenotypical_DataQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_PHENOTYPICAL_DATA = gql(`
  query fetch_phenotypical_data($variable_name: [String!]!) {
    phenotypical_data(variable_name: $variable_name) {
      participant_id
      participant_profile_dss
      participant_profile_dss_internal_id
      value_numeric
      value_text
      variable_name
      variable_status
      assigned_category
    }
  }
`);

export type PhenotypicalDataPoint =
  Fetch_Phenotypical_DataQuery["phenotypical_data"][number];

export function usePhenotypicalData(variableNames: string[], skip = false): {
  data: PhenotypicalDataPoint[] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
} {
  const { data, loading, error } = useQuery(GET_PHENOTYPICAL_DATA, {
    variables: { variable_name: variableNames },
    skip: skip || variableNames.length === 0,
  });
  return { data: data?.phenotypical_data, loading, error };
}
