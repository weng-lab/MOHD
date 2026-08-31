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
    "\nquery fetchATACMetadata {\n  atac_metadata {\n    kit\n    protocol\n    sample_id\n    sex\n    site\n    status\n    pca_x\n    pca_y\n    umap_x\n    umap_y\n  }\n}\n ": typeof types.FetchAtacMetadataDocument,
    "\nquery fetchLipidomicsData {\n  lipidomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  lipidomics_molecules {\n    position\n    molecule_name\n  }\n}\n ": typeof types.FetchLipidomicsDataDocument,
    "\nquery fetchMetabolomicsData {\n  metabolomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metabolomics_compounds {\n    position\n    compound\n    mode\n  }\n}\n ": typeof types.FetchMetabolomicsDataDocument,
    "\nquery fetchMetallomicsData {\n  metallomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metallomics_metals {\n    metal\n    position\n  }\n}\n ": typeof types.FetchMetallomicsDataDocument,
    "\nquery fetchRNAMetadata {\n  rna_metadata {\n    kit\n    sample_id\n    sex\n    site\n    status\n    umap_x\n    umap_y\n    pca_x\n    pca_y\n  }\n}\n ": typeof types.FetchRnaMetadataDocument,
    "\nquery fetchWGBSMetadata {\n  wgbs_metadata {\n    kit\n    pca_x\n    pca_y\n    umap_x\n    umap_y\n    sample_id\n    sex\n    site\n    status\n    age_at_enrollment\n  }\n}\n ": typeof types.FetchWgbsMetadataDocument,
    "\n  query fetch_phenotypical_data($variable_name: [String!]!) {\n    phenotypical_data(variable_name: $variable_name) {\n      participant_profile_dss\n      participant_profile_dss_internal_id\n      value_numeric\n      value_text\n      variable_name\n      variable_status\n    }\n  }\n": typeof types.Fetch_Phenotypical_DataDocument,
    "\n  query fetch_phenotypical_variable {\n    phenotypical_variables {\n      variable_category\n      variable_name\n    }\n  }\n": typeof types.Fetch_Phenotypical_VariableDocument,
};
const documents: Documents = {
    "\nquery fetchATACMetadata {\n  atac_metadata {\n    kit\n    protocol\n    sample_id\n    sex\n    site\n    status\n    pca_x\n    pca_y\n    umap_x\n    umap_y\n  }\n}\n ": types.FetchAtacMetadataDocument,
    "\nquery fetchLipidomicsData {\n  lipidomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  lipidomics_molecules {\n    position\n    molecule_name\n  }\n}\n ": types.FetchLipidomicsDataDocument,
    "\nquery fetchMetabolomicsData {\n  metabolomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metabolomics_compounds {\n    position\n    compound\n    mode\n  }\n}\n ": types.FetchMetabolomicsDataDocument,
    "\nquery fetchMetallomicsData {\n  metallomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metallomics_metals {\n    metal\n    position\n  }\n}\n ": types.FetchMetallomicsDataDocument,
    "\nquery fetchRNAMetadata {\n  rna_metadata {\n    kit\n    sample_id\n    sex\n    site\n    status\n    umap_x\n    umap_y\n    pca_x\n    pca_y\n  }\n}\n ": types.FetchRnaMetadataDocument,
    "\nquery fetchWGBSMetadata {\n  wgbs_metadata {\n    kit\n    pca_x\n    pca_y\n    umap_x\n    umap_y\n    sample_id\n    sex\n    site\n    status\n    age_at_enrollment\n  }\n}\n ": types.FetchWgbsMetadataDocument,
    "\n  query fetch_phenotypical_data($variable_name: [String!]!) {\n    phenotypical_data(variable_name: $variable_name) {\n      participant_profile_dss\n      participant_profile_dss_internal_id\n      value_numeric\n      value_text\n      variable_name\n      variable_status\n    }\n  }\n": types.Fetch_Phenotypical_DataDocument,
    "\n  query fetch_phenotypical_variable {\n    phenotypical_variables {\n      variable_category\n      variable_name\n    }\n  }\n": types.Fetch_Phenotypical_VariableDocument,
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
export function gql(source: "\nquery fetchATACMetadata {\n  atac_metadata {\n    kit\n    protocol\n    sample_id\n    sex\n    site\n    status\n    pca_x\n    pca_y\n    umap_x\n    umap_y\n  }\n}\n "): (typeof documents)["\nquery fetchATACMetadata {\n  atac_metadata {\n    kit\n    protocol\n    sample_id\n    sex\n    site\n    status\n    pca_x\n    pca_y\n    umap_x\n    umap_y\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchLipidomicsData {\n  lipidomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  lipidomics_molecules {\n    position\n    molecule_name\n  }\n}\n "): (typeof documents)["\nquery fetchLipidomicsData {\n  lipidomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  lipidomics_molecules {\n    position\n    molecule_name\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchMetabolomicsData {\n  metabolomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metabolomics_compounds {\n    position\n    compound\n    mode\n  }\n}\n "): (typeof documents)["\nquery fetchMetabolomicsData {\n  metabolomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metabolomics_compounds {\n    position\n    compound\n    mode\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchMetallomicsData {\n  metallomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metallomics_metals {\n    metal\n    position\n  }\n}\n "): (typeof documents)["\nquery fetchMetallomicsData {\n  metallomics_quantification {\n    sample_id\n    site\n    status\n    sex\n    quant_values\n  }\n  metallomics_metals {\n    metal\n    position\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchRNAMetadata {\n  rna_metadata {\n    kit\n    sample_id\n    sex\n    site\n    status\n    umap_x\n    umap_y\n    pca_x\n    pca_y\n  }\n}\n "): (typeof documents)["\nquery fetchRNAMetadata {\n  rna_metadata {\n    kit\n    sample_id\n    sex\n    site\n    status\n    umap_x\n    umap_y\n    pca_x\n    pca_y\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery fetchWGBSMetadata {\n  wgbs_metadata {\n    kit\n    pca_x\n    pca_y\n    umap_x\n    umap_y\n    sample_id\n    sex\n    site\n    status\n    age_at_enrollment\n  }\n}\n "): (typeof documents)["\nquery fetchWGBSMetadata {\n  wgbs_metadata {\n    kit\n    pca_x\n    pca_y\n    umap_x\n    umap_y\n    sample_id\n    sex\n    site\n    status\n    age_at_enrollment\n  }\n}\n "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query fetch_phenotypical_data($variable_name: [String!]!) {\n    phenotypical_data(variable_name: $variable_name) {\n      participant_profile_dss\n      participant_profile_dss_internal_id\n      value_numeric\n      value_text\n      variable_name\n      variable_status\n    }\n  }\n"): (typeof documents)["\n  query fetch_phenotypical_data($variable_name: [String!]!) {\n    phenotypical_data(variable_name: $variable_name) {\n      participant_profile_dss\n      participant_profile_dss_internal_id\n      value_numeric\n      value_text\n      variable_name\n      variable_status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query fetch_phenotypical_variable {\n    phenotypical_variables {\n      variable_category\n      variable_name\n    }\n  }\n"): (typeof documents)["\n  query fetch_phenotypical_variable {\n    phenotypical_variables {\n      variable_category\n      variable_name\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;