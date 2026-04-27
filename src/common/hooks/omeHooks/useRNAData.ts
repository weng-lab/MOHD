import { gql } from "@/common/types/generated/gql";
import { FetchRnaMetadataQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_RNA_DATA = gql(`
query fetchRNAMetadata {
  rna_metadata {
    sample_id
    sex
    site
    kit
    status
    umap_x
    umap_y
  }
}
 `);

export type UseRNADataParams = {
  skip?: boolean
};

export type UseRNADataReturn = {
  data: FetchRnaMetadataQuery["rna_metadata"] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

export const useRNAData = ({ skip }: UseRNADataParams): UseRNADataReturn => {
  const { data, loading, error } = useQuery(GET_RNA_DATA, {
    skip: skip,
  });

  return {
    data: data?.rna_metadata,
    loading,
    error,
  };
};
