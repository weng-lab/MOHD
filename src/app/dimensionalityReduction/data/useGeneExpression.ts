import { useQuery } from "@apollo/client/react";
import { gql } from "@/common/types/generated/gql";
import type { FeatureStatus, FeatureValues } from "../model/features";

/**
 * One gene's expression across every RNA sample, matched on the unversioned id: a version the API
 * doesn't hold returns an empty list, which would read as "no data" once GENCODE moves on.
 */
const GET_GENE_EXPRESSION = gql(`
query fetchGeneExpression($gene: String!) {
  gene_values(gene_id_without_version: $gene) {
    gene_id
    gene_name
    samples {
      sample_id
      value
    }
  }
}
`);

/** Fetched in the browser, a gene at a time, as the reader picks one. */
export const useGeneExpression = (id: string | null): FeatureValues => {
  const { data, loading, error } = useQuery(GET_GENE_EXPRESSION, {
    variables: { gene: id ?? "" },
    skip: id === null,
  });

  // One row per version the API holds, which in practice is one.
  const match = data?.gene_values[0];

  const status: FeatureStatus =
    id === null ? "idle" : loading ? "loading" : error ? "error" : match ? "ready" : "missing";

  return {
    id,
    name: match?.gene_name ?? null,
    values: match
      ? new Map(
          match.samples.flatMap(({ sample_id, value }) =>
            value === null || value === undefined ? [] : [[sample_id, value] as const]
          )
        )
      : null,
    status,
  };
};
