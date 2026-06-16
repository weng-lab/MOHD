import { gql } from "@/common/types/generated/gql";
import { Fetch_Phenotypical_VariableQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_PHENOTYPICAL_VARIABLES = gql(`
  query fetch_phenotypical_variable {
    phenotypical_variables {
      variable_category
      variable_name
    }
  }
`);

export type PhenotypicalVariable =
  Fetch_Phenotypical_VariableQuery["phenotypical_variables"][number];

export function usePhenotypicalVariables(): {
  data: PhenotypicalVariable[] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
} {
  const { data, loading, error } = useQuery(GET_PHENOTYPICAL_VARIABLES);

  return {
    data: data?.phenotypical_variables,
    loading,
    error,
  };
}
