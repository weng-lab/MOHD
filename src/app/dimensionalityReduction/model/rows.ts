import { atacProtocol, type AtacProtocolKey } from "@/common/atacProtocols";
import { PC_COUNT } from "@/common/components/pcAxis";
import type { ExplorerOme, Method } from "./omes";
import type { ExplorerData } from "./types";

/**
 * The rows a method places, one protocol's alone where each had its own PCA - see OME_CAPABILITIES.
 * Every row has PCs; UMAP coordinates are checked per row.
 */
export const rowsFor = (data: ExplorerData, ome: ExplorerOme, method: Method, protocol: AtacProtocolKey | null) => {
  const value = protocol && atacProtocol(protocol).value;
  return data[ome].rows.filter((row) => (method !== "UMAP" || row.umap) && (!value || row.protocol === value));
};

const NO_PVE: (number | null)[] = Array.from({ length: PC_COUNT }, () => null);

/** The variance each PC explains in the PCA a protocol's samples, or the whole ome's, were placed by. */
export const pveFor = (data: ExplorerData, ome: ExplorerOme, protocol: AtacProtocolKey | null) =>
  data[ome].pcas.find((pca) => pca.protocol === protocol)?.pve ?? NO_PVE;

/** Every ome's samples, which the explorer assigns shapes across so a value keeps its shape as you switch. */
export const allRows = (data: ExplorerData) => Object.values(data).flatMap(({ rows }) => rows);
