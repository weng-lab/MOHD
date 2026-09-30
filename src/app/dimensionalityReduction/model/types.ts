import type { FeatureOption } from "./features";
import type { Metric } from "./metrics";
import type { ExplorerOme } from "./omes";

/**
 * One sample as the explorer plots it: the server flattens the six omes' metadata types, which
 * differ in nullability and embeddings, into this shape.
 */
export type ExplorerRow = {
  sample_id: string;
  /** pc1..pc10, zero-indexed: pcs[0] is PC1. */
  pcs: number[];
  /** [umap_x, umap_y], or null on an ome with no UMAP. */
  umap: [number, number] | null;
  /** QC or reference material rather than a participant's sample - see QC_GROUP. */
  qc: boolean;
  site: string | null;
  status: string | null;
  sex: string | null;
  /** Binned by the API ("0-9" ... "80+"). Raw age is sensitive and never fetched. */
  age_bin: string | null;
  protocol: string | null;
  condition: string | null;
  /** Library quality metrics, on ATAC. Absent elsewhere, rather than nulls that would bloat the payload. */
  metrics?: Record<Metric, number | null>;
};

export type OmeData = {
  rows: ExplorerRow[];
  /** Percent of variance explained, zero-indexed to match `pcs`: pve[0] is PC1's. */
  pve: (number | null)[];
  /** What the mass-spec picker lists, in order. Values are fetched a feature at a time. */
  features?: FeatureOption[];
};

export type ExplorerData = Record<ExplorerOme, OmeData>;
