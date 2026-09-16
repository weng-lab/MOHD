import { gql } from "@/common/types/generated/gql";

/**
 * Every ome the explorer offers, in one round trip.
 *
 * Selects age_bin and never age_at_enrollment: the API bins age itself, so raw
 * age has no reason to reach this server, let alone the cache or the page.
 */
export const GET_DIMENSIONALITY_REDUCTION = gql(`
query fetchDimensionalityReductionExplorer {
  atac_metadata {
    sample_id
    kit
    participant_id
    visit
    condition
    protocol
    site
    status
    sex
    age_bin
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
  }
  rna_metadata {
    sample_id
    kit
    participant_id
    visit
    condition
    protocol
    site
    status
    sex
    age_bin
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
  }
  wgbs_metadata {
    sample_id
    kit
    participant_id
    visit
    condition
    protocol
    site
    status
    sex
    age_bin
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
  }
  lipidomics_metadata {
    sample_id
    kit
    participant_id
    visit
    condition
    protocol
    site
    status
    sex
    age_bin
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
  metabolomics_metadata {
    sample_id
    kit
    participant_id
    visit
    condition
    protocol
    site
    status
    sex
    age_bin
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
  metallomics_metadata {
    sample_id
    kit
    participant_id
    visit
    condition
    protocol
    site
    status
    sex
    age_bin
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
  atac_variance: pca_variance(ome: ATAC) {
    pc
    pve
  }
  rna_variance: pca_variance(ome: RNA) {
    pc
    pve
  }
  wgbs_variance: pca_variance(ome: WGBS) {
    pc
    pve
  }
  lipidomics_variance: pca_variance(ome: Lipidomics) {
    pc
    pve
  }
  metabolomics_variance: pca_variance(ome: Metabolomics) {
    pc
    pve
  }
  metallomics_variance: pca_variance(ome: Metallomics) {
    pc
    pve
  }
}
`);
