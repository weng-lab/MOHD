import type { OmesDataType } from "@/common/types/globalTypes";
import type { FeatureKind } from "./features";

/**
 * In switcher order, named as the app's routes name them (?ome=lipidomics, as in /omes/lipidomics)
 * rather than by the API's PcaOme enum. WGS has its own page, and exposomics' data is sensitive.
 */
export const EXPLORER_OMES = [
  "ATAC",
  "RNA",
  "WGBS",
  "lipidomics",
  "metabolomics",
  "metallomics",
] as const satisfies readonly OmesDataType[];

export type ExplorerOme = (typeof EXPLORER_OMES)[number];

export type OmeCapabilities = {
  /** Whether the ome has a UMAP embedding. Every ome has PCA. */
  umap: boolean;
  /** Whether protocol varies across the ome's samples, and so is worth a color. */
  protocol: boolean;
  /** Whether the ome has library quality metrics to color by. WGBS has the fields, but all null. */
  metrics: boolean;
  /** The kind of feature whose quantification can color the plot - see features.ts. */
  feature: FeatureKind | null;
};

export const OME_CAPABILITIES: Record<ExplorerOme, OmeCapabilities> = {
  ATAC: { umap: true, protocol: true, metrics: true, feature: null },
  RNA: { umap: true, protocol: false, metrics: false, feature: "gene" },
  WGBS: { umap: true, protocol: false, metrics: false, feature: null },
  lipidomics: { umap: false, protocol: false, metrics: false, feature: "lipid" },
  metabolomics: { umap: false, protocol: false, metrics: false, feature: "metabolite" },
  metallomics: { umap: false, protocol: false, metrics: false, feature: "metal" },
};

/** Case-insensitive, so a hand-typed ?ome=rna still finds RNA. */
export const findOme = (value: string | null): ExplorerOme | undefined =>
  EXPLORER_OMES.find((ome) => ome.toLowerCase() === value?.toLowerCase());

export const METHODS = ["PCA", "UMAP"] as const;

export type Method = (typeof METHODS)[number];

/** Number of principal components the API exposes per ome. */
export const PC_COUNT = 10;

/** "PC1 (22.2%)", or "PC1" where the API has no variance for it. The API's pve is already a percentage. */
export const pcLabel = (pc: number, pve: readonly (number | null)[]) => {
  const value = pve[pc - 1];
  return value === null || value === undefined ? `PC${pc}` : `PC${pc} (${value.toFixed(1)}%)`;
};
