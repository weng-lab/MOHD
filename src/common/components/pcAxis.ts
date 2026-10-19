export const PC_OPTIONS = ["pc1", "pc2", "pc3", "pc4", "pc5", "pc6", "pc7", "pc8", "pc9", "pc10"] as const;
export type PcField = (typeof PC_OPTIONS)[number];

/** Number of principal components the API exposes for every PCA, each ome's and WGS's alike. */
export const PC_COUNT = PC_OPTIONS.length;

/** Percent of variance explained, keyed by 1-indexed PC number. */
export type PcVarianceMap = Map<number, number | null | undefined>;

/**
 * A PC as every axis and axis menu names it: "PC1 (41.2%)", or a bare "PC1" where there's no
 * variance for it (still loading, or the API has none for that PC). `pc` counts from 1, as the name
 * does; the API's pve is already a percentage. Rounded here so the decimal is always shown: a PC on
 * 1.0% would otherwise read "1%" beside its neighbors' "41.2%".
 */
export const pcLabel = (pc: number, pve: number | null | undefined) =>
  pve === null || pve === undefined ? `PC${pc}` : `PC${pc} (${pve.toFixed(1)}%)`;

/** pcLabel for a PC field ("pc1"), with its variance looked up in the map. */
export const formatPcLabel = (field: PcField, pve?: PcVarianceMap) => {
  const pc = Number(field.slice(2));
  return pcLabel(pc, pve?.get(pc));
};
