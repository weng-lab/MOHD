/**
 * ATAC-seq's library protocols. Each protocol's samples had a PCA of their own, so every plot shows
 * them apart: one protocol's PC1 has nothing to do with another's. In the order the plots offer
 * them, the protocol with the most samples first.
 *
 * `value` is the protocol as a sample's metadata names it, and `key` as pca_variance does: a
 * hand-kept pairing, since the API spells the two differently. `key` is also what an explorer link
 * carries (?protocol=BuffyCoat).
 */
export const ATAC_PROTOCOLS = [
  { key: "CPT", value: "CPT method" },
  { key: "OPC", value: "OPC method" },
  { key: "BuffyCoat", value: "Buffy Coat method" },
] as const;

export type AtacProtocol = (typeof ATAC_PROTOCOLS)[number];

export type AtacProtocolKey = AtacProtocol["key"];

export const atacProtocol = (key: AtacProtocolKey): AtacProtocol => ATAC_PROTOCOLS.find((p) => p.key === key)!;

/** Case-insensitive, so a hand-typed ?protocol=cpt still finds CPT. */
export const findAtacProtocol = (key: string | null): AtacProtocolKey | undefined =>
  ATAC_PROTOCOLS.find((p) => p.key.toLowerCase() === key?.toLowerCase())?.key;
