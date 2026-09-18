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
 *   color   site | status | sex | age | protocol, on ATAC tss | frip | reads, on RNA expression
 *   gene    Ensembl id without its version (ENSG00000000971); kept on RNA whatever colors the plot
 *   shape   none | site | status | sex | protocol - not age, which has too many bins to shape by
 *   hide    repeated; "field:value" fades one value's samples, "qc" fades the QC ones
 *           e.g. ?hide=site:LEO&hide=age:80%2B&hide=qc
 */

import { isGeneId } from "./expression";
import { isColorBy, isField, offersColor, type ColorBy, type Field } from "./fields";
import { OME_CAPABILITIES, PC_COUNT, findOme, type ExplorerOme, type Method } from "./omes";
import { NO_SHAPE, isShapeBy, shapeFieldsFor, type ShapeBy } from "./shapes";

export type ExplorerState = {
  ome: ExplorerOme;
  method: Method;
  /** PC on each axis, 1-based as it is labelled. Kept through a switch to UMAP and back. */
  x: number;
  y: number;
  color: ColorBy;
  /**
   * The gene whose expression colors the plot, as an unversioned Ensembl id. Kept through a change
   * of coloring and back, the way x and y are kept through a switch to UMAP - looking at the sites
   * for a moment should not cost the reader the gene they searched for. Dropped only on an ome with
   * no expression to show, where there is nothing for it to mean.
   */
  gene: string | null;
  /** The field points are shaped by, or NO_SHAPE while they are all circles. */
  shape: ShapeBy;
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
  gene: null,
  shape: NO_SHAPE,
  hidden: {},
  hideQc: false,
};

const QC_HIDE_VALUE = "qc";

/**
 * Brings a state back inside what its ome supports. Runs on every read and every write, so a
 * hand-edited link and a click that switches ome end up in the same valid place: UMAP falls back
 * to PCA where there is none, a field or metric the ome lacks falls back to site, a shape field
 * the ome lacks falls back to none, and a PC on both axes moves off the y axis.
 */
export const normalize = (state: ExplorerState): ExplorerState => {
  const color = offersColor(state.ome, state.color) ? state.color : DEFAULT_STATE.color;
  return {
    ...state,
    method: state.method === "UMAP" && !OME_CAPABILITIES[state.ome].umap ? "PCA" : state.method,
    color,
    // Against the ome rather than the coloring, so a gene survives a look at another field and is
    // there on the way back. An ome that cannot show expression has nothing to hold it for.
    gene: OME_CAPABILITIES[state.ome].expression ? state.gene : null,
    shape: shapeFieldsFor(state.ome).some(({ key }) => key === state.shape) ? state.shape : NO_SHAPE,
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
  const gene = params.get("gene");
  const shape = params.get("shape");
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
    // Shaped like an id, not known to exist: what the API makes of it is the query's answer, and a
    // gene that turns out not to be quantified is reported on the plot rather than silently dropped.
    gene: isGeneId(gene) ? gene : DEFAULT_STATE.gene,
    shape: isShapeBy(shape) ? shape : DEFAULT_STATE.shape,
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
  if (state.gene !== null) params.set("gene", state.gene);
  if (state.shape !== DEFAULT_STATE.shape) params.set("shape", state.shape);

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
