export const PC_OPTIONS = ["pc1", "pc2", "pc3", "pc4", "pc5", "pc6", "pc7", "pc8", "pc9", "pc10"] as const;
export type PcField = (typeof PC_OPTIONS)[number];

/** Percent of variance explained, keyed by 1-indexed PC number. */
export type PcVarianceMap = Map<number, number | null | undefined>;

/**
 * Axis label for a PC: "PC1 (41.2%)", or a bare "PC1" where there's no
 * variance data for it (still loading, or the API has none for that PC).
 */
export const formatPcLabel = (field: PcField, pve?: PcVarianceMap) => {
  const pc = Number(field.slice(2));
  const base = `PC${pc}`;
  const value = pve?.get(pc);
  return value === null || value === undefined ? base : `${base} (${value.toFixed(1)}%)`;
};
