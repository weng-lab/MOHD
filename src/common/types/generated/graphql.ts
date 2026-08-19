/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AtacAccession = {
  __typename?: 'AtacAccession';
  accession: Scalars['String']['output'];
  samples: Array<AtacSample>;
};

/** ATAC z-score value for an accession in a sample */
export type AtacSample = {
  __typename?: 'AtacSample';
  metadata: AtacSampleMetadata;
  value: Scalars['Float']['output'];
};

/** ATAC sample metadata */
export type AtacSampleMetadata = {
  __typename?: 'AtacSampleMetadata';
  age_at_enrollment: Scalars['Int']['output'];
  condition: Scalars['String']['output'];
  entity_id: Scalars['String']['output'];
  frip_score?: Maybe<Scalars['Float']['output']>;
  kit: Scalars['String']['output'];
  participant_id: Scalars['String']['output'];
  pca_x?: Maybe<Scalars['Float']['output']>;
  pca_y?: Maybe<Scalars['Float']['output']>;
  protocol: Scalars['String']['output'];
  reads_mapped?: Maybe<Scalars['Float']['output']>;
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tss_enrichment_score?: Maybe<Scalars['Float']['output']>;
  tube: Scalars['String']['output'];
  umap_x?: Maybe<Scalars['Float']['output']>;
  umap_y?: Maybe<Scalars['Float']['output']>;
  visit: Scalars['String']['output'];
};

export type ExposomicsSampleMetadata = {
  __typename?: 'ExposomicsSampleMetadata';
  sample_id: Scalars['String']['output'];
  sex?: Maybe<Scalars['String']['output']>;
  site: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
};

export type LipidomicsSampleMetadata = {
  __typename?: 'LipidomicsSampleMetadata';
  sample_id: Scalars['String']['output'];
  sex?: Maybe<Scalars['String']['output']>;
  site: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
};

export type MetabolomicsSampleMetadata = {
  __typename?: 'MetabolomicsSampleMetadata';
  sample_id: Scalars['String']['output'];
  sex?: Maybe<Scalars['String']['output']>;
  site: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
};

export type MetallomicsQuantValues = {
  __typename?: 'MetallomicsQuantValues';
  metal: Scalars['String']['output'];
  value?: Maybe<Scalars['Float']['output']>;
};

export type MetallomicsQuantifications = {
  __typename?: 'MetallomicsQuantifications';
  quantification: Array<Maybe<MetallomicsQuantValues>>;
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type MetallomicsSampleMetadata = {
  __typename?: 'MetallomicsSampleMetadata';
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type PhenotypicalData = {
  __typename?: 'PhenotypicalData';
  participant_id: Scalars['String']['output'];
  participant_profile_dss: Scalars['String']['output'];
  participant_profile_dss_internal_id?: Maybe<Scalars['Int']['output']>;
  value_numeric?: Maybe<Scalars['Float']['output']>;
  value_text?: Maybe<Scalars['String']['output']>;
  variable_category?: Maybe<Scalars['String']['output']>;
  variable_name: Scalars['String']['output'];
  variable_status?: Maybe<Scalars['String']['output']>;
};

export type PhenotypicalDataVariables = {
  __typename?: 'PhenotypicalDataVariables';
  variable_category?: Maybe<Scalars['String']['output']>;
  variable_name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  atac_metadata: Array<AtacSampleMetadata>;
  atac_zscore: Array<AtacAccession>;
  exposomics_metadata: Array<ExposomicsSampleMetadata>;
  lipidomics_metadata: Array<LipidomicsSampleMetadata>;
  metabolomics_metadata: Array<MetabolomicsSampleMetadata>;
  metallomics_metadata: Array<MetallomicsSampleMetadata>;
  metallomics_quantification: Array<Maybe<MetallomicsQuantifications>>;
  phenotypical_data: Array<PhenotypicalData>;
  phenotypical_variables: Array<PhenotypicalDataVariables>;
  rna_metadata: Array<RnaSampleMetadata>;
  rna_tpm: Array<RnaGene>;
  wgbs_metadata: Array<WgbsSampleMetadata>;
  wgs_metadata: Array<WgsSampleMetadata>;
};


export type QueryAtac_ZscoreArgs = {
  accessions: Array<Scalars['String']['input']>;
};


export type QueryPhenotypical_DataArgs = {
  variable_name: Array<Scalars['String']['input']>;
};


export type QueryRna_TpmArgs = {
  gene_ids: Array<Scalars['String']['input']>;
};

export type RnaGene = {
  __typename?: 'RnaGene';
  gene_id: Scalars['String']['output'];
  samples: Array<RnaSample>;
};

/** RNA expression value for a gene in a sample */
export type RnaSample = {
  __typename?: 'RnaSample';
  metadata: RnaSampleMetadata;
  value: Scalars['Float']['output'];
};

/** RNA sample metadata */
export type RnaSampleMetadata = {
  __typename?: 'RnaSampleMetadata';
  age_at_enrollment: Scalars['Int']['output'];
  condition: Scalars['String']['output'];
  entity_id: Scalars['String']['output'];
  kit: Scalars['String']['output'];
  participant_id: Scalars['String']['output'];
  pca_x?: Maybe<Scalars['Float']['output']>;
  pca_y?: Maybe<Scalars['Float']['output']>;
  protocol: Scalars['String']['output'];
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tube: Scalars['String']['output'];
  umap_x?: Maybe<Scalars['Float']['output']>;
  umap_y?: Maybe<Scalars['Float']['output']>;
  visit: Scalars['String']['output'];
};

export type WgbsSampleMetadata = {
  __typename?: 'WgbsSampleMetadata';
  age_at_enrollment: Scalars['Int']['output'];
  condition: Scalars['String']['output'];
  entity_id: Scalars['String']['output'];
  frip_score?: Maybe<Scalars['Float']['output']>;
  kit: Scalars['String']['output'];
  participant_id: Scalars['String']['output'];
  pca_x?: Maybe<Scalars['Float']['output']>;
  pca_y?: Maybe<Scalars['Float']['output']>;
  protocol: Scalars['String']['output'];
  reads_mapped?: Maybe<Scalars['Float']['output']>;
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tss_enrichment_score?: Maybe<Scalars['Float']['output']>;
  tube: Scalars['String']['output'];
  umap_x?: Maybe<Scalars['Float']['output']>;
  umap_y?: Maybe<Scalars['Float']['output']>;
  visit: Scalars['String']['output'];
};

export type WgsSampleMetadata = {
  __typename?: 'WgsSampleMetadata';
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type FetchAtacMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchAtacMetadataQuery = { __typename?: 'Query', atac_metadata: Array<{ __typename?: 'AtacSampleMetadata', kit: string, protocol: string, sample_id: string, sex: string, site: string, status: string, pca_x?: number | null, pca_y?: number | null, umap_x?: number | null, umap_y?: number | null }> };

export type FetchMetallomicsDataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchMetallomicsDataQuery = { __typename?: 'Query', metallomics_quantification: Array<{ __typename?: 'MetallomicsQuantifications', sample_id: string, site: string, status: string, sex: string, quantification: Array<{ __typename?: 'MetallomicsQuantValues', metal: string, value?: number | null } | null> } | null> };

export type FetchRnaMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchRnaMetadataQuery = { __typename?: 'Query', rna_metadata: Array<{ __typename?: 'RnaSampleMetadata', kit: string, sample_id: string, sex: string, site: string, status: string, umap_x?: number | null, umap_y?: number | null, pca_x?: number | null, pca_y?: number | null }> };

export type FetchWgbsMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchWgbsMetadataQuery = { __typename?: 'Query', wgbs_metadata: Array<{ __typename?: 'WgbsSampleMetadata', kit: string, pca_x?: number | null, pca_y?: number | null, umap_x?: number | null, umap_y?: number | null, sample_id: string, sex: string, site: string, status: string, age_at_enrollment: number }> };

export type Fetch_Phenotypical_DataQueryVariables = Exact<{
  variable_name: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type Fetch_Phenotypical_DataQuery = { __typename?: 'Query', phenotypical_data: Array<{ __typename?: 'PhenotypicalData', participant_profile_dss: string, participant_profile_dss_internal_id?: number | null, value_numeric?: number | null, value_text?: string | null, variable_name: string, variable_status?: string | null }> };

export type Fetch_Phenotypical_VariableQueryVariables = Exact<{ [key: string]: never; }>;


export type Fetch_Phenotypical_VariableQuery = { __typename?: 'Query', phenotypical_variables: Array<{ __typename?: 'PhenotypicalDataVariables', variable_category?: string | null, variable_name: string }> };


export const FetchAtacMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchATACMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"atac_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kit"}},{"kind":"Field","name":{"kind":"Name","value":"protocol"}},{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pca_x"}},{"kind":"Field","name":{"kind":"Name","value":"pca_y"}},{"kind":"Field","name":{"kind":"Name","value":"umap_x"}},{"kind":"Field","name":{"kind":"Name","value":"umap_y"}}]}}]}}]} as unknown as DocumentNode<FetchAtacMetadataQuery, FetchAtacMetadataQueryVariables>;
export const FetchMetallomicsDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchMetallomicsData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metallomics_quantification"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"quantification"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metal"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<FetchMetallomicsDataQuery, FetchMetallomicsDataQueryVariables>;
export const FetchRnaMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchRNAMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rna_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kit"}},{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"umap_x"}},{"kind":"Field","name":{"kind":"Name","value":"umap_y"}},{"kind":"Field","name":{"kind":"Name","value":"pca_x"}},{"kind":"Field","name":{"kind":"Name","value":"pca_y"}}]}}]}}]} as unknown as DocumentNode<FetchRnaMetadataQuery, FetchRnaMetadataQueryVariables>;
export const FetchWgbsMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchWGBSMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wgbs_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kit"}},{"kind":"Field","name":{"kind":"Name","value":"pca_x"}},{"kind":"Field","name":{"kind":"Name","value":"pca_y"}},{"kind":"Field","name":{"kind":"Name","value":"umap_x"}},{"kind":"Field","name":{"kind":"Name","value":"umap_y"}},{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"age_at_enrollment"}}]}}]}}]} as unknown as DocumentNode<FetchWgbsMetadataQuery, FetchWgbsMetadataQueryVariables>;
export const Fetch_Phenotypical_DataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetch_phenotypical_data"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"variable_name"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phenotypical_data"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"variable_name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"variable_name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"participant_profile_dss"}},{"kind":"Field","name":{"kind":"Name","value":"participant_profile_dss_internal_id"}},{"kind":"Field","name":{"kind":"Name","value":"value_numeric"}},{"kind":"Field","name":{"kind":"Name","value":"value_text"}},{"kind":"Field","name":{"kind":"Name","value":"variable_name"}},{"kind":"Field","name":{"kind":"Name","value":"variable_status"}}]}}]}}]} as unknown as DocumentNode<Fetch_Phenotypical_DataQuery, Fetch_Phenotypical_DataQueryVariables>;
export const Fetch_Phenotypical_VariableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetch_phenotypical_variable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phenotypical_variables"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"variable_category"}},{"kind":"Field","name":{"kind":"Name","value":"variable_name"}}]}}]}}]} as unknown as DocumentNode<Fetch_Phenotypical_VariableQuery, Fetch_Phenotypical_VariableQueryVariables>;