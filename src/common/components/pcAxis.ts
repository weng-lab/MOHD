export const PC_OPTIONS = ["pc1", "pc2", "pc3", "pc4", "pc5", "pc6", "pc7", "pc8", "pc9", "pc10"] as const;
export type PcField = (typeof PC_OPTIONS)[number];

export const formatPcLabel = (field: PcField) => `PC-${field.slice(2)}`;
