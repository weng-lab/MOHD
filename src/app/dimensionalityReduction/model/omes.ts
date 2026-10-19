import type { OmesDataType } from "@/common/types/globalTypes";
import type { FeatureKind } from "./features";
import { SHOW_UMAP } from "@/common/umap";

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
  /** Whether the ome has a UMAP embedding. Every ome has PCA. None do while SHOW_UMAP is off. */
  umap: boolean;
  /** Whether the ome has library quality metrics to color by. WGBS has the fields, but all null. */
  metrics: boolean;
  /** The kind of feature whose quantification can color the plot - see features.ts. */
  feature: FeatureKind | null;
};

export const OME_CAPABILITIES: Record<ExplorerOme, OmeCapabilities> = {
  ATAC: { umap: SHOW_UMAP, metrics: true, feature: null },
  RNA: { umap: SHOW_UMAP, metrics: false, feature: "gene" },
  WGBS: { umap: SHOW_UMAP, metrics: false, feature: null },
  lipidomics: { umap: false, metrics: false, feature: "lipid" },
  metabolomics: { umap: false, metrics: false, feature: "metabolite" },
  metallomics: { umap: false, metrics: false, feature: "metal" },
};

/** Case-insensitive, so a hand-typed ?ome=rna still finds RNA. */
export const findOme = (value: string | null): ExplorerOme | undefined =>
  EXPLORER_OMES.find((ome) => ome.toLowerCase() === value?.toLowerCase());

export const METHODS = ["PCA", "UMAP"] as const;

export type Method = (typeof METHODS)[number];
