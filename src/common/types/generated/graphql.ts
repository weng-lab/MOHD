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
export type AtacSampleMetadata = SampleMetadata & {
  __typename?: 'AtacSampleMetadata';
  biospecimen: Scalars['String']['output'];
  entity_id: Scalars['String']['output'];
  kit: Scalars['String']['output'];
  opc_id: Scalars['String']['output'];
  protocol: Scalars['String']['output'];
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
  umap_x?: Maybe<Scalars['Float']['output']>;
  umap_y?: Maybe<Scalars['Float']['output']>;
};

export type ExposomicsSampleMetadata = SampleMetadata & {
  __typename?: 'ExposomicsSampleMetadata';
  kit: Scalars['String']['output'];
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type LipidomicsSampleMetadata = SampleMetadata & {
  __typename?: 'LipidomicsSampleMetadata';
  kit: Scalars['String']['output'];
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type MetabolomicsSampleMetadata = SampleMetadata & {
  __typename?: 'MetabolomicsSampleMetadata';
  kit: Scalars['String']['output'];
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type OmeDownloadFiles = {
  __typename?: 'OmeDownloadFiles';
  file_ome: OmeEnum;
  file_type: Scalars['String']['output'];
  filename: Scalars['String']['output'];
  open_access?: Maybe<Scalars['Boolean']['output']>;
  sample_id: Scalars['String']['output'];
  size: Scalars['String']['output'];
};

/** Available omes */
export enum OmeEnum {
  AtacSeq = 'ATAC_SEQ',
  Exposomics = 'EXPOSOMICS',
  Lipidomics = 'LIPIDOMICS',
  Metabolomics = 'METABOLOMICS',
  Proteomics = 'PROTEOMICS',
  RnaSeq = 'RNA_SEQ',
  Wgbs = 'WGBS',
  Wgs = 'WGS'
}

export type ProteomicsSampleMetadata = SampleMetadata & {
  __typename?: 'ProteomicsSampleMetadata';
  kit: Scalars['String']['output'];
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  atac_metadata: Array<AtacSampleMetadata>;
  atac_zscore: Array<AtacAccession>;
  exposomics_metadata: Array<ExposomicsSampleMetadata>;
  fetch_download_files?: Maybe<Array<Maybe<OmeDownloadFiles>>>;
  lipidomics_metadata: Array<LipidomicsSampleMetadata>;
  metabolomics_metadata: Array<MetabolomicsSampleMetadata>;
  proteomics_metadata: Array<ProteomicsSampleMetadata>;
  rna_metadata: Array<RnaSampleMetadata>;
  rna_tpm: Array<RnaGene>;
  wgbs_metadata: Array<WgbsSampleMetadata>;
  wgs_metadata: Array<WgsSampleMetadata>;
};


export type QueryAtac_ZscoreArgs = {
  accessions: Array<Scalars['String']['input']>;
};


export type QueryFetch_Download_FilesArgs = {
  ome: OmeEnum;
  sample_id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
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
export type RnaSampleMetadata = SampleMetadata & {
  __typename?: 'RnaSampleMetadata';
  kit: Scalars['String']['output'];
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
  umap_x?: Maybe<Scalars['Float']['output']>;
  umap_y?: Maybe<Scalars['Float']['output']>;
};

/** Shared fields for all samples */
export type SampleMetadata = {
  kit: Scalars['String']['output'];
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type WgbsSampleMetadata = SampleMetadata & {
  __typename?: 'WgbsSampleMetadata';
  kit: Scalars['String']['output'];
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type WgsSampleMetadata = SampleMetadata & {
  __typename?: 'WgsSampleMetadata';
  kit: Scalars['String']['output'];
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type FetchAtacMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchAtacMetadataQuery = { __typename?: 'Query', atac_metadata: Array<{ __typename?: 'AtacSampleMetadata', sample_id: string, status: string, site: string, sex: string, protocol: string, umap_x?: number | null, umap_y?: number | null, opc_id: string }> };

export type FetchExposomicsMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchExposomicsMetadataQuery = { __typename?: 'Query', exposomics_metadata: Array<{ __typename?: 'ExposomicsSampleMetadata', kit: string, sample_id: string, sex: string, site: string, status: string }> };

export type FetchLipidomicsMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchLipidomicsMetadataQuery = { __typename?: 'Query', lipidomics_metadata: Array<{ __typename?: 'LipidomicsSampleMetadata', kit: string, sample_id: string, sex: string, site: string, status: string }> };

export type FetchMetabolomicsMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchMetabolomicsMetadataQuery = { __typename?: 'Query', metabolomics_metadata: Array<{ __typename?: 'MetabolomicsSampleMetadata', kit: string, sample_id: string, sex: string, site: string, status: string }> };

export type FetchProteomicsMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchProteomicsMetadataQuery = { __typename?: 'Query', proteomics_metadata: Array<{ __typename?: 'ProteomicsSampleMetadata', kit: string, sample_id: string, sex: string, site: string, status: string }> };

export type FetchRnaMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchRnaMetadataQuery = { __typename?: 'Query', rna_metadata: Array<{ __typename?: 'RnaSampleMetadata', sample_id: string, sex: string, site: string, kit: string, status: string, umap_x?: number | null, umap_y?: number | null }> };

export type FetchWgbsMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchWgbsMetadataQuery = { __typename?: 'Query', wgbs_metadata: Array<{ __typename?: 'WgbsSampleMetadata', kit: string, sample_id: string, sex: string, site: string, status: string }> };

export type FetchWgsMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchWgsMetadataQuery = { __typename?: 'Query', wgs_metadata: Array<{ __typename?: 'WgsSampleMetadata', sample_id: string, sex: string, site: string, kit: string, status: string }> };

export type FetchDownloadFilesQueryVariables = Exact<{
  ome: OmeEnum;
}>;


export type FetchDownloadFilesQuery = { __typename?: 'Query', fetch_download_files?: Array<{ __typename?: 'OmeDownloadFiles', filename: string, file_type: string, size: string, file_ome: OmeEnum, sample_id: string, open_access?: boolean | null } | null> | null };


export const FetchAtacMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchATACMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"atac_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"protocol"}},{"kind":"Field","name":{"kind":"Name","value":"umap_x"}},{"kind":"Field","name":{"kind":"Name","value":"umap_y"}},{"kind":"Field","name":{"kind":"Name","value":"opc_id"}}]}}]}}]} as unknown as DocumentNode<FetchAtacMetadataQuery, FetchAtacMetadataQueryVariables>;
export const FetchExposomicsMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchExposomicsMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exposomics_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kit"}},{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<FetchExposomicsMetadataQuery, FetchExposomicsMetadataQueryVariables>;
export const FetchLipidomicsMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchLipidomicsMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lipidomics_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kit"}},{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<FetchLipidomicsMetadataQuery, FetchLipidomicsMetadataQueryVariables>;
export const FetchMetabolomicsMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchMetabolomicsMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metabolomics_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kit"}},{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<FetchMetabolomicsMetadataQuery, FetchMetabolomicsMetadataQueryVariables>;
export const FetchProteomicsMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchProteomicsMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"proteomics_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kit"}},{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<FetchProteomicsMetadataQuery, FetchProteomicsMetadataQueryVariables>;
export const FetchRnaMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchRNAMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rna_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"kit"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"umap_x"}},{"kind":"Field","name":{"kind":"Name","value":"umap_y"}}]}}]}}]} as unknown as DocumentNode<FetchRnaMetadataQuery, FetchRnaMetadataQueryVariables>;
export const FetchWgbsMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchWGBSMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wgbs_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kit"}},{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<FetchWgbsMetadataQuery, FetchWgbsMetadataQueryVariables>;
export const FetchWgsMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchWGSMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wgs_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"kit"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<FetchWgsMetadataQuery, FetchWgsMetadataQueryVariables>;
export const FetchDownloadFilesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchDownloadFiles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ome"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OmeEnum"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fetch_download_files"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ome"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ome"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"file_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"file_ome"}},{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"open_access"}}]}}]}}]} as unknown as DocumentNode<FetchDownloadFilesQuery, FetchDownloadFilesQueryVariables>;