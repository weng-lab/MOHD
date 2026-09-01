import { gql } from "@/common/types/generated/gql";

export const GET_WGS_PCA = gql(`
query fetchWGSPCA {
  wgs_pca {
    sample_id
    cohort
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
    superpop
    sex
    project
    age
    case_status
    sex_at_birth
    site
    recruited_condition
    reported_race_ethnicity
    gnomad_pop
  }
}
`);
