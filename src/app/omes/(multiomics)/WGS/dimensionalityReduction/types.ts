/**
 * Client-facing data shapes for the WGS PCA page.
 *
 * These are deliberately NOT the raw GraphQL row type. The server splits the
 * single flat `wgs_pca` type into its two cohorts (the schema packs both into
 * one shape, so every row carries nulls for the other cohort's fields) and
 * bins participant age before anything reaches the browser.
 */

/** Number of principal components exposed by the API. */
export const PC_COUNT = 10;

/** 1000G+HGDP reference samples. */
export type ReferenceRow = {
  sample_id: string;
  /** pc1..pc10, zero-indexed: pcs[0] is PC1. */
  pcs: number[];
  superpop: string | null;
  gnomad_pop: string | null;
  sex: string | null;
  project: string | null;
};

/** MOHD cohort samples. Raw age is never included - see ageBin() on the server. */
export type MohdRow = {
  sample_id: string;
  pcs: number[];
  case_status: string | null;
  sex_at_birth: string | null;
  site: string | null;
  recruited_condition: string | null;
  reported_race_ethnicity: string | null;
  /** 10-year band, top-coded at "80+". Raw age stays on the server. */
  age_bin: string | null;
};

export type PCAData = {
  reference: ReferenceRow[];
  mohd: MohdRow[];
  /**
   * Percent of variance explained, zero-indexed to match `pcs`: pve[0] is PC1's.
   */
  pve: (number | null)[];
};
