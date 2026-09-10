/**
 * Client-facing row shape for the WGBS dimensionality reduction page.
 *
 * Deliberately not the raw GraphQL row type: age_at_enrollment is sensitive
 * and is binned on the server before anything reaches the browser - see
 * ageBin() in page.tsx.
 */
export type WGBSRow = {
  sample_id: string;
  kit: string;
  pc1: number | null;
  pc2: number | null;
  pc3: number | null;
  pc4: number | null;
  pc5: number | null;
  pc6: number | null;
  pc7: number | null;
  pc8: number | null;
  pc9: number | null;
  pc10: number | null;
  umap_x: number | null;
  umap_y: number | null;
  sex: string;
  site: string;
  status: string;
  /** Bucketed by getAgeBin() on the server. Raw age never leaves it. */
  age_bin: string;
};
