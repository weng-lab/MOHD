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
  entity_id: Scalars['String']['output'];
  opc_id: Scalars['String']['output'];
  protocol: Scalars['String']['output'];
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
  umap_x?: Maybe<Scalars['Float']['output']>;
  umap_y?: Maybe<Scalars['Float']['output']>;
};

export type Query = {
  __typename?: 'Query';
  atac_metadata: Array<AtacSampleMetadata>;
  atac_zscore: Array<AtacAccession>;
  rna_metadata: Array<RnaSampleMetadata>;
  rna_tpm: Array<RnaGene>;
};


export type QueryAtac_ZscoreArgs = {
  accessions: Array<Scalars['String']['input']>;
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
  sample_id: Scalars['String']['output'];
  sex: Scalars['String']['output'];
  site: Scalars['String']['output'];
  status: Scalars['String']['output'];
  umap_x?: Maybe<Scalars['Float']['output']>;
  umap_y?: Maybe<Scalars['Float']['output']>;
};

export type FetchAtacMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchAtacMetadataQuery = { __typename?: 'Query', atac_metadata: Array<{ __typename?: 'AtacSampleMetadata', sample_id: string, status: string, site: string, sex: string, protocol: string, umap_x?: number | null, umap_y?: number | null, opc_id: string }> };

export type FetchRnaMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchRnaMetadataQuery = { __typename?: 'Query', rna_metadata: Array<{ __typename?: 'RnaSampleMetadata', sample_id: string, sex: string, site: string, kit: string, status: string, umap_x?: number | null, umap_y?: number | null }> };


export const FetchAtacMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchATACMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"atac_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"protocol"}},{"kind":"Field","name":{"kind":"Name","value":"umap_x"}},{"kind":"Field","name":{"kind":"Name","value":"umap_y"}},{"kind":"Field","name":{"kind":"Name","value":"opc_id"}}]}}]}}]} as unknown as DocumentNode<FetchAtacMetadataQuery, FetchAtacMetadataQueryVariables>;
export const FetchRnaMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fetchRNAMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rna_metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sample_id"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"kit"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"umap_x"}},{"kind":"Field","name":{"kind":"Name","value":"umap_y"}}]}}]}}]} as unknown as DocumentNode<FetchRnaMetadataQuery, FetchRnaMetadataQueryVariables>;