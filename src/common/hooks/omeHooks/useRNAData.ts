import { gql } from "@/common/types/generated/gql";
import { FetchRnaMetadataQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { toSample, type SampleGroups } from "@/common/sampleFields/fields";

const GET_RNA_DATA = gql(`
query fetchRNAMetadata {
  rna_metadata {
    kit
    sample_id
    sex
    site
    status
    age_bin
    umap_x
    umap_y
    pc1
    pc2
    pc3
    pc4
    pc5
    pc6
    pc7
    pc8
    pc9
    pc10
  }
}
 `);

export type UseRNADataParams = {
  skip?: boolean;
};

export type UseRNADataReturn = {
  /** The API's rows, with QC material flagged by its kit - see toSample. */
  data: (FetchRnaMetadataQuery["rna_metadata"][number] & SampleGroups)[] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

export const useRNAData = ({ skip }: UseRNADataParams): UseRNADataReturn => {
  const { data, loading, error } = useQuery(GET_RNA_DATA, {
    skip: skip,
  });

  return {
    data: data?.rna_metadata.map(toSample),
    loading,
    error,
  };
};
