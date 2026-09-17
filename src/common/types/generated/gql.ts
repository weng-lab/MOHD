/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\nquery fetchWGSPCA {\n  wgs_pca {\n    sample_id\n    cohort\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n    superpop\n    sex\n    project\n    age_bin\n    case_status\n    sex_at_birth\n    site\n    recruited_condition\n    reported_race_ethnicity\n    gnomad_pop\n  }\n  wgs_pca_variance {\n    pc\n    pve\n  }\n}\n": typeof types.FetchWgspcaDocument,
    "\nquery fetchATACMetadata {\n  atac_metadata {\n    kit\n    protocol\n    sample_id\n    sex\n    site\n    status\n    age_bin\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n    umap_x\n    umap_y\n  }\n}\n ": typeof types.FetchAtacMetadataDocument,
    "\nquery fetchExposomicsData {\n  exposomics_molecules {\n    position\n    molecule_list\n    molecule_name\n    precursor_mz\n    precursor_ion_type\n    smiles\n    formula\n    inchikey\n    num_detected_samples\n  }\n  exposomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n}\n ": typeof types.FetchExposomicsDataDocument,
    "\nquery fetchLipidomicsDimensionalityReduction {\n  lipidomics_metadata {\n    sample_id\n    kit\n    sex\n    site\n    status\n    age_bin\n    tube\n    visit\n    participant_id\n    condition\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n ": typeof types.FetchLipidomicsDimensionalityReductionDocument,
    "\nquery fetchLipidomicsQuantification {\n  lipidomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  lipidomics_molecules {\n    position\n    molecule_name\n  }\n}\n ": typeof types.FetchLipidomicsQuantificationDocument,
    "\nquery fetchMetabolomicsDimensionalityReduction {\n  metabolomics_metadata {\n    sample_id\n    kit\n    sex\n    site\n    status\n    age_bin\n    tube\n    visit\n    participant_id\n    condition\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n ": typeof types.FetchMetabolomicsDimensionalityReductionDocument,
    "\nquery fetchMetabolomicsQuantification {\n  metabolomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metabolomics_compounds {\n    position\n    compound\n    mode\n  }\n}\n ": typeof types.FetchMetabolomicsQuantificationDocument,
    "\nquery fetchMetallomicsData {\n  metallomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metallomics_metals {\n    metal\n    position\n  }\n}\n ": typeof types.FetchMetallomicsDataDocument,
    "\nquery fetchMetallomicsDimensionalityReduction {\n  metallomics_metadata {\n    sample_id\n    kit\n    sex\n    site\n    status\n    age_bin\n    tube\n    visit\n    condition\n    protocol\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n ": typeof types.FetchMetallomicsDimensionalityReductionDocument,
    "\nquery fetchPcaVariance($ome: PcaOme!) {\n  pca_variance(ome: $ome) {\n    pc\n    pve\n  }\n}\n ": typeof types.FetchPcaVarianceDocument,
    "\nquery fetchRNAMetadata {\n  rna_metadata {\n    kit\n    sample_id\n    sex\n    site\n    status\n    age_bin\n    umap_x\n    umap_y\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n ": typeof types.FetchRnaMetadataDocument,
    "\nquery fetchWGBSMetadata {\n  wgbs_metadata {\n    kit\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n    umap_x\n    umap_y\n    sample_id\n    sex\n    site\n    status\n    age_bin\n  }\n}\n ": typeof types.FetchWgbsMetadataDocument,
    "\n  query fetch_phenotypical_data($variable_name: [String!]!) {\n    phenotypical_data(variable_name: $variable_name) {\n      value_numeric\n      value_text\n      variable_name\n      variable_status\n    }\n  }\n": typeof types.Fetch_Phenotypical_DataDocument,
    "\n  query fetch_phenotypical_variable {\n    phenotypical_variables {\n      unit\n      variable_category\n      variable_name\n    }\n  }\n": typeof types.Fetch_Phenotypical_VariableDocument,
};
const documents: Documents = {
    "\nquery fetchWGSPCA {\n  wgs_pca {\n    sample_id\n    cohort\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n    superpop\n    sex\n    project\n    age_bin\n    case_status\n    sex_at_birth\n    site\n    recruited_condition\n    reported_race_ethnicity\n    gnomad_pop\n  }\n  wgs_pca_variance {\n    pc\n    pve\n  }\n}\n": types.FetchWgspcaDocument,
    "\nquery fetchATACMetadata {\n  atac_metadata {\n    kit\n    protocol\n    sample_id\n    sex\n    site\n    status\n    age_bin\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n    umap_x\n    umap_y\n  }\n}\n ": types.FetchAtacMetadataDocument,
    "\nquery fetchExposomicsData {\n  exposomics_molecules {\n    position\n    molecule_list\n    molecule_name\n    precursor_mz\n    precursor_ion_type\n    smiles\n    formula\n    inchikey\n    num_detected_samples\n  }\n  exposomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n}\n ": types.FetchExposomicsDataDocument,
    "\nquery fetchLipidomicsDimensionalityReduction {\n  lipidomics_metadata {\n    sample_id\n    kit\n    sex\n    site\n    status\n    age_bin\n    tube\n    visit\n    participant_id\n    condition\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n ": types.FetchLipidomicsDimensionalityReductionDocument,
    "\nquery fetchLipidomicsQuantification {\n  lipidomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  lipidomics_molecules {\n    position\n    molecule_name\n  }\n}\n ": types.FetchLipidomicsQuantificationDocument,
    "\nquery fetchMetabolomicsDimensionalityReduction {\n  metabolomics_metadata {\n    sample_id\n    kit\n    sex\n    site\n    status\n    age_bin\n    tube\n    visit\n    participant_id\n    condition\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n ": types.FetchMetabolomicsDimensionalityReductionDocument,
    "\nquery fetchMetabolomicsQuantification {\n  metabolomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metabolomics_compounds {\n    position\n    compound\n    mode\n  }\n}\n ": types.FetchMetabolomicsQuantificationDocument,
    "\nquery fetchMetallomicsData {\n  metallomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metallomics_metals {\n    metal\n    position\n  }\n}\n ": types.FetchMetallomicsDataDocument,
    "\nquery fetchMetallomicsDimensionalityReduction {\n  metallomics_metadata {\n    sample_id\n    kit\n    sex\n    site\n    status\n    age_bin\n    tube\n    visit\n    condition\n    protocol\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n ": types.FetchMetallomicsDimensionalityReductionDocument,
    "\nquery fetchPcaVariance($ome: PcaOme!) {\n  pca_variance(ome: $ome) {\n    pc\n    pve\n  }\n}\n ": types.FetchPcaVarianceDocument,
    "\nquery fetchRNAMetadata {\n  rna_metadata {\n    kit\n    sample_id\n    sex\n    site\n    status\n    age_bin\n    umap_x\n    umap_y\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n ": types.FetchRnaMetadataDocument,
    "\nquery fetchWGBSMetadata {\n  wgbs_metadata {\n    kit\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n    umap_x\n    umap_y\n    sample_id\n    sex\n    site\n    status\n    age_bin\n  }\n}\n ": types.FetchWgbsMetadataDocument,
    "\n  query fetch_phenotypical_data($variable_name: [String!]!) {\n    phenotypical_data(variable_name: $variable_name) {\n      value_numeric\n      value_text\n      variable_name\n      variable_status\n    }\n  }\n": types.Fetch_Phenotypical_DataDocument,
    "\n  query fetch_phenotypical_variable {\n    phenotypical_variables {\n      unit\n      variable_category\n      variable_name\n    }\n  }\n": types.Fetch_Phenotypical_VariableDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchWGSPCA {\n  wgs_pca {\n    sample_id\n    cohort\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n    superpop\n    sex\n    project\n    age_bin\n    case_status\n    sex_at_birth\n    site\n    recruited_condition\n    reported_race_ethnicity\n    gnomad_pop\n  }\n  wgs_pca_variance {\n    pc\n    pve\n  }\n}\n"): (typeof documents)["\nquery fetchWGSPCA {\n  wgs_pca {\n    sample_id\n    cohort\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n    superpop\n    sex\n    project\n    age_bin\n    case_status\n    sex_at_birth\n    site\n    recruited_condition\n    reported_race_ethnicity\n    gnomad_pop\n  }\n  wgs_pca_variance {\n    pc\n    pve\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchATACMetadata {\n  atac_metadata {\n    kit\n    protocol\n    sample_id\n    sex\n    site\n    status\n    age_bin\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n    umap_x\n    umap_y\n  }\n}\n "): (typeof documents)["\nquery fetchATACMetadata {\n  atac_metadata {\n    kit\n    protocol\n    sample_id\n    sex\n    site\n    status\n    age_bin\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n    umap_x\n    umap_y\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchExposomicsData {\n  exposomics_molecules {\n    position\n    molecule_list\n    molecule_name\n    precursor_mz\n    precursor_ion_type\n    smiles\n    formula\n    inchikey\n    num_detected_samples\n  }\n  exposomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n}\n "): (typeof documents)["\nquery fetchExposomicsData {\n  exposomics_molecules {\n    position\n    molecule_list\n    molecule_name\n    precursor_mz\n    precursor_ion_type\n    smiles\n    formula\n    inchikey\n    num_detected_samples\n  }\n  exposomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchLipidomicsDimensionalityReduction {\n  lipidomics_metadata {\n    sample_id\n    kit\n    sex\n    site\n    status\n    age_bin\n    tube\n    visit\n    participant_id\n    condition\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n "): (typeof documents)["\nquery fetchLipidomicsDimensionalityReduction {\n  lipidomics_metadata {\n    sample_id\n    kit\n    sex\n    site\n    status\n    age_bin\n    tube\n    visit\n    participant_id\n    condition\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchLipidomicsQuantification {\n  lipidomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  lipidomics_molecules {\n    position\n    molecule_name\n  }\n}\n "): (typeof documents)["\nquery fetchLipidomicsQuantification {\n  lipidomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  lipidomics_molecules {\n    position\n    molecule_name\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchMetabolomicsDimensionalityReduction {\n  metabolomics_metadata {\n    sample_id\n    kit\n    sex\n    site\n    status\n    age_bin\n    tube\n    visit\n    participant_id\n    condition\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n "): (typeof documents)["\nquery fetchMetabolomicsDimensionalityReduction {\n  metabolomics_metadata {\n    sample_id\n    kit\n    sex\n    site\n    status\n    age_bin\n    tube\n    visit\n    participant_id\n    condition\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchMetabolomicsQuantification {\n  metabolomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metabolomics_compounds {\n    position\n    compound\n    mode\n  }\n}\n "): (typeof documents)["\nquery fetchMetabolomicsQuantification {\n  metabolomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metabolomics_compounds {\n    position\n    compound\n    mode\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchMetallomicsData {\n  metallomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metallomics_metals {\n    metal\n    position\n  }\n}\n "): (typeof documents)["\nquery fetchMetallomicsData {\n  metallomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metallomics_metals {\n    metal\n    position\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchMetallomicsDimensionalityReduction {\n  metallomics_metadata {\n    sample_id\n    kit\n    sex\n    site\n    status\n    age_bin\n    tube\n    visit\n    condition\n    protocol\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n "): (typeof documents)["\nquery fetchMetallomicsDimensionalityReduction {\n  metallomics_metadata {\n    sample_id\n    kit\n    sex\n    site\n    status\n    age_bin\n    tube\n    visit\n    condition\n    protocol\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchPcaVariance($ome: PcaOme!) {\n  pca_variance(ome: $ome) {\n    pc\n    pve\n  }\n}\n "): (typeof documents)["\nquery fetchPcaVariance($ome: PcaOme!) {\n  pca_variance(ome: $ome) {\n    pc\n    pve\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchRNAMetadata {\n  rna_metadata {\n    kit\n    sample_id\n    sex\n    site\n    status\n    age_bin\n    umap_x\n    umap_y\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n "): (typeof documents)["\nquery fetchRNAMetadata {\n  rna_metadata {\n    kit\n    sample_id\n    sex\n    site\n    status\n    age_bin\n    umap_x\n    umap_y\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchWGBSMetadata {\n  wgbs_metadata {\n    kit\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n    umap_x\n    umap_y\n    sample_id\n    sex\n    site\n    status\n    age_bin\n  }\n}\n "): (typeof documents)["\nquery fetchWGBSMetadata {\n  wgbs_metadata {\n    kit\n    pc1\n    pc2\n    pc3\n    pc4\n    pc5\n    pc6\n    pc7\n    pc8\n    pc9\n    pc10\n    umap_x\n    umap_y\n    sample_id\n    sex\n    site\n    status\n    age_bin\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query fetch_phenotypical_data($variable_name: [String!]!) {\n    phenotypical_data(variable_name: $variable_name) {\n      value_numeric\n      value_text\n      variable_name\n      variable_status\n    }\n  }\n"): (typeof documents)["\n  query fetch_phenotypical_data($variable_name: [String!]!) {\n    phenotypical_data(variable_name: $variable_name) {\n      value_numeric\n      value_text\n      variable_name\n      variable_status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query fetch_phenotypical_variable {\n    phenotypical_variables {\n      unit\n      variable_category\n      variable_name\n    }\n  }\n"): (typeof documents)["\n  query fetch_phenotypical_variable {\n    phenotypical_variables {\n      unit\n      variable_category\n      variable_name\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;