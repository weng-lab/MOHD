import { gql } from "@/common/types/generated/gql";

export const GET_WGBS_DATA = gql(`
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
