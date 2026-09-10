import { gql } from "@/common/types/generated/gql";

export const GET_WGBS_DATA = gql(`
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
    age_at_enrollment
  }
}
 `);
