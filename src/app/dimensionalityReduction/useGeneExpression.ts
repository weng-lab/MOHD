import { useQuery } from "@apollo/client/react";
import { gql } from "@/common/types/generated/gql";
import type { FeatureStatus, FeatureValues } from "./features";

/**
 * One gene's expression across every RNA sample.
 *
 * Matched on the unversioned id. The API also takes a full GENCODE id, and the search hands one
 * over, but that would tie every saved link to the release the quantification happened to be built
 * on - and a version the API does not hold comes back as an empty list rather than an error, so the
 * failure would read as "this gene has no data". gene_values answers with the version it holds.
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

/**
 * Fetched in the browser rather than with the page: which gene is the reader's choice to make, and
 * the answer is ~900 numbers against a matrix of tens of thousands of genes.
 */
export const useGeneExpression = (id: string | null): FeatureValues => {
  const { data, loading, error } = useQuery(GET_GENE_EXPRESSION, {
    variables: { gene: id ?? "" },
    skip: id === null,
  });

  // The API answers with every version of the gene it holds. The quantification carries one, so
  // this list is one row; taking the first rather than asserting means a second version could only
  // pick the wrong one, never throw on a reader mid-search.
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
