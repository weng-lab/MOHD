/**
 * The explorer's state, and how it is written into and read back out of the URL.
 *
 * The URL is where the state lives, which is what makes every view linkable:
 * /dimensionalityReduction?ome=RNA&method=UMAP opens exactly that. Only what differs from
 * DEFAULT_STATE is written, so the default view stays a bare path.
 *
 *   ome     ATAC | RNA | WGBS | lipidomics | metabolomics | metallomics   (case-insensitive)
 *   method  PCA | UMAP
 *   x, y    principal component on each axis, 1-10
 *   color   site | status | sex | age | protocol, and on ATAC tss | frip | reads
 *   hide    repeated; "field:value" fades one value's samples, "qc" fades the QC ones
 *           e.g. ?hide=site:LEO&hide=age:80%2B&hide=qc
 */

import { colorOptionsFor, isColorBy, isField, type ColorBy, type Field } from "./fields";
import { OME_CAPABILITIES, PC_COUNT, findOme, type ExplorerOme, type Method } from "./omes";

export type ExplorerState = {
  ome: ExplorerOme;
  method: Method;
  /** PC on each axis, 1-based as it is labelled. Kept through a switch to UMAP and back. */
  x: number;
  y: number;
  color: ColorBy;
  /**
   * Values hidden, per field. Kept across a change of ome, so a filter applies wherever its
   * value exists - hide a site and it stays hidden as you move between omes.
   */
  hidden: Partial<Record<Field, string[]>>;
  /** QC and reference samples keep their own color by default, rather than being faded out. */
  hideQc: boolean;
};

export const DEFAULT_STATE: ExplorerState = {
  ome: "ATAC",
  method: "PCA",
  x: 1,
  y: 2,
  color: "site",
  hidden: {},
  hideQc: false,
};

const QC_HIDE_VALUE = "qc";

/**
 * Brings a state back inside what its ome supports. Runs on every read and every write, so a
 * hand-edited link and a click that switches ome end up in the same valid place: UMAP falls back
 * to PCA where there is none, a field or metric the ome lacks falls back to site, and a PC on
 * both axes moves off the y axis.
 */
export const normalize = (state: ExplorerState): ExplorerState => {
  const { fields, metrics } = colorOptionsFor(state.ome);
  return {
    ...state,
    method: state.method === "UMAP" && !OME_CAPABILITIES[state.ome].umap ? "PCA" : state.method,
    color: [...fields, ...metrics].some(({ key }) => key === state.color) ? state.color : DEFAULT_STATE.color,
    y: state.y === state.x ? (state.x === 1 ? 2 : 1) : state.y,
  };
};

type ReadableParams = {
  get(name: string): string | null;
  getAll(name: string): string[];
};

const parsePc = (raw: string | null, fallback: number) => {
  const pc = Number(raw);
  return raw !== null && Number.isInteger(pc) && pc >= 1 && pc <= PC_COUNT ? pc : fallback;
};

/** Reads a state out of search params. Anything unrecognised falls back to its default rather than failing. */
export const parseState = (params: ReadableParams): ExplorerState => {
  const color = params.get("color");
  const hidden: Partial<Record<Field, string[]>> = {};
  let hideQc = false;

  for (const entry of params.getAll("hide")) {
    if (entry === QC_HIDE_VALUE) {
      hideQc = true;
      continue;
    }
    // Split on the first colon only: the field names have none, but a value might.
    const separator = entry.indexOf(":");
    const field = entry.slice(0, separator);
    const value = entry.slice(separator + 1);
    if (separator > 0 && value && isField(field)) (hidden[field] ??= []).push(value);
  }

  return normalize({
    ome: findOme(params.get("ome")) ?? DEFAULT_STATE.ome,
    method: params.get("method")?.toUpperCase() === "UMAP" ? "UMAP" : "PCA",
    x: parsePc(params.get("x"), DEFAULT_STATE.x),
    y: parsePc(params.get("y"), DEFAULT_STATE.y),
    color: isColorBy(color) ? color : DEFAULT_STATE.color,
    hidden,
    hideQc,
  });
};

/** Writes a state as a query string, without the leading "?". Hidden values are sorted, so one view has one URL. */
export const serializeState = (state: ExplorerState): string => {
  const params = new URLSearchParams();

  if (state.ome !== DEFAULT_STATE.ome) params.set("ome", state.ome);
  if (state.method !== DEFAULT_STATE.method) params.set("method", state.method);
  if (state.x !== DEFAULT_STATE.x) params.set("x", String(state.x));
  if (state.y !== DEFAULT_STATE.y) params.set("y", String(state.y));
  if (state.color !== DEFAULT_STATE.color) params.set("color", state.color);

  for (const [field, values] of Object.entries(state.hidden).sort(([a], [b]) => a.localeCompare(b))) {
    for (const value of [...new Set(values)].sort()) params.append("hide", `${field}:${value}`);
  }
  if (state.hideQc) params.append("hide", QC_HIDE_VALUE);

  return params.toString();
};

/** Shows a hidden value, or hides a shown one. */
export const toggleHidden = (state: ExplorerState, field: Field, value: string): ExplorerState => {
  const current = state.hidden[field] ?? [];
  return {
    ...state,
    hidden: {
      ...state.hidden,
      [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    },
  };
};
