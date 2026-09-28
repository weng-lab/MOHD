import type { ExplorerOme, Method } from "./omes";
import type { ExplorerData } from "./types";

/** The rows a method places. Every row has PCs; UMAP coordinates are checked per row. */
export const rowsFor = (data: ExplorerData, ome: ExplorerOme, method: Method) =>
  method === "UMAP" ? data[ome].rows.filter((row) => row.umap) : data[ome].rows;

/** Every ome's samples, which the explorer assigns shapes across so a value keeps its shape as you switch. */
export const allRows = (data: ExplorerData) => Object.values(data).flatMap(({ rows }) => rows);
