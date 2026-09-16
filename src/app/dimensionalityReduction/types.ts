import type { ExplorerOme } from "./omes";

/**
 * One sample as the explorer plots it.
 *
 * Deliberately not the raw GraphQL row. The six metadata types disagree on nullability and on
 * which embeddings exist, so the server flattens them to this one shape, drops any row with no
 * coordinates, and rounds the coordinates it keeps.
 */
export type ExplorerRow = {
  sample_id: string;
  /** pc1..pc10, zero-indexed: pcs[0] is PC1. */
  pcs: number[];
  /** [umap_x, umap_y], or null on an ome with no UMAP. */
  umap: [number, number] | null;
  /**
   * QC or reference material rather than a participant's sample. These carry no site, status,
   * sex or age, and are plotted as one grey group - see QC_GROUP.
   */
  qc: boolean;
  site: string | null;
  status: string | null;
  sex: string | null;
  /** Binned by the API ("0-9" ... "80+"). Raw age is never fetched. */
  age_bin: string | null;
  protocol: string | null;
  condition: string | null;
  kit: string | null;
  participant_id: string | null;
  visit: string | null;
};

export type OmeData = {
  rows: ExplorerRow[];
  /** Percent of variance explained, zero-indexed to match `pcs`: pve[0] is PC1's. */
  pve: (number | null)[];
};

export type ExplorerData = Record<ExplorerOme, OmeData>;
