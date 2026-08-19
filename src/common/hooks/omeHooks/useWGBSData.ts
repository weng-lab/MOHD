import { gql } from "@/common/types/generated/gql";
import { FetchWgbsMetadataQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_WGBS_DATA = gql(`
query fetchWGBSMetadata {
  wgbs_metadata {
    kit
    pca_x
    pca_y
    umap_x
    umap_y
    sample_id
    sex
    site
    status
    age_at_enrollment
  }
}
 `);

export type UseWGBSDataParams = {
  skip?: boolean
};

export type UseWGBSDataReturn = {
  data: FetchWgbsMetadataQuery["wgbs_metadata"] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

export const useWGBSData = ({ skip }: UseWGBSDataParams): UseWGBSDataReturn => {
  const { data, loading, error } = useQuery(GET_WGBS_DATA, {
    skip: skip,
  });

  return {
    data: data?.wgbs_metadata,
    loading,
    error,
  };
};
