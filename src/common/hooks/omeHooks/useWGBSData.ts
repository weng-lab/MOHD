import { gql } from "@/common/types/generated/gql";
import { FetchWgbsMetadataQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { toSample, type SampleGroups } from "@/common/sampleFields/fields";

const GET_WGBS_DATA = gql(`
query fetchWGBSMetadata {
  wgbs_metadata {
    kit
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
    umap_x
    umap_y
    sample_id
    sex
    site
    status
    age_bin
  }
}
 `);

export type UseWGBSDataParams = {
  skip?: boolean;
};

export type UseWGBSDataReturn = {
  /** The API's rows, with QC material flagged by its kit - see toSample. */
  data: (FetchWgbsMetadataQuery["wgbs_metadata"][number] & SampleGroups)[] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

export const useWGBSData = ({ skip }: UseWGBSDataParams): UseWGBSDataReturn => {
  const { data, loading, error } = useQuery(GET_WGBS_DATA, {
    skip: skip,
  });

  return {
    data: data?.wgbs_metadata.map(toSample),
    loading,
    error,
  };
};
