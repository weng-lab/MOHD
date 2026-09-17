import type { OmesDataType } from "@/common/types/globalTypes";

/**
 * The omes the explorer offers, in the order its switcher lists them.
 *
 * Named as the rest of the app names them rather than by the API's PcaOme enum, so a link reads
 * like the ome pages it sits beside: ?ome=lipidomics, as in /omes/lipidomics. WGS is left out -
 * it has its own page, built around a reference panel - and so is exposomics, whose data is
 * sensitive.
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
  /** Whether protocol varies across the ome's samples. Everywhere else it is one value, not worth a color. */
  protocol: boolean;
  /**
   * Whether the ome has library quality metrics to color by - see metrics.ts. WGBS's metadata type
   * has the same three fields, but every one of them is null.
   */
  metrics: boolean;
};

export const OME_CAPABILITIES: Record<ExplorerOme, OmeCapabilities> = {
  ATAC: { umap: true, protocol: true, metrics: true },
  RNA: { umap: true, protocol: false, metrics: false },
  WGBS: { umap: true, protocol: false, metrics: false },
  lipidomics: { umap: false, protocol: false, metrics: false },
  metabolomics: { umap: false, protocol: false, metrics: false },
  metallomics: { umap: false, protocol: false, metrics: false },
};

/** Case-insensitive, so a hand-typed ?ome=rna still finds RNA. */
export const findOme = (value: string | null): ExplorerOme | undefined =>
  EXPLORER_OMES.find((ome) => ome.toLowerCase() === value?.toLowerCase());

export const METHODS = ["PCA", "UMAP"] as const;

export type Method = (typeof METHODS)[number];

/** Number of principal components the API exposes per ome. */
export const PC_COUNT = 10;

/**
 * "PC1 (22.2%)", or a bare "PC1" where the API has no variance for it.
 *
 * The API's pve is already a percentage - unlike the fractions the original applet hardcoded - so
 * it is only rounded here, never scaled.
 */
export const pcLabel = (pc: number, pve: readonly (number | null)[]) => {
  const value = pve[pc - 1];
  return value === null || value === undefined ? `PC${pc}` : `PC${pc} (${value.toFixed(1)}%)`;
};
