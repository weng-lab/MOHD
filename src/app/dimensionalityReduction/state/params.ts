/**
 * The explorer's state, which lives in the URL so every view is linkable. Only what differs from
 * DEFAULT_STATE is written, so the default view is a bare path.
 *
 *   ome     ATAC | RNA | WGBS | lipidomics | metabolomics | metallomics   (case-insensitive)
 *   method  PCA | UMAP
 *   x, y    principal component on each axis, 1-10
 *   color   site | status | sex | age | protocol, on ATAC tss | frip | reads, on RNA expression,
 *           and on lipidomics, metabolomics and metallomics feature
 *   feature on RNA an Ensembl id without its version (ENSG00000000971), on the mass-spec omes a
 *           name as the data spells it (Metformin, TG(52:2) [SIM]); kept whatever colors the plot
 *   shape   none | site | status | sex | protocol - not age, which has too many bins to shape by
 *   hide    repeated; "field:value" fades one value's samples, "qc" fades the QC ones
 *           e.g. ?hide=site:LEO&hide=age:80%2B&hide=qc
 *   range   low,high - where a metric's or feature's colors stop, in the data's own units (reads,
 *           TPM), to four significant figures: ?range=5.87,31.27
 */

import { isFeatureId } from "../model/features";
import { isColorBy, isContinuous, offersColor, type ColorBy } from "../model/colorBy";
import { isField, type Field } from "@/common/sampleFields/fields";
import { OME_CAPABILITIES, PC_COUNT, findOme, type ExplorerOme, type Method } from "../model/omes";
import { NO_SHAPE, isShapeBy, shapeFieldsFor, type ShapeBy } from "@/common/sampleFields/shapes";

export type ExplorerState = {
  ome: ExplorerOme;
  method: Method;
  /** PC on each axis, 1-based as it is labeled. Kept through a switch to UMAP and back. */
  x: number;
  y: number;
  color: ColorBy;
  /**
   * An unversioned Ensembl id on RNA, a name on the mass-spec omes. Kept through a change of
   * coloring, so a glance at site doesn't cost the reader their gene; dropped with a change of ome.
   */
  feature: string | null;
  /** The field points are shaped by, or NO_SHAPE while they are all circles. */
  shape: ShapeBy;
  /** Values hidden, per field. Kept across a change of ome, so a hidden site stays hidden. */
  hidden: Partial<Record<Field, string[]>>;
  /** Fades the QC and reference samples, which otherwise keep their own color. */
  hideQc: boolean;
  /**
   * Where a metric's or feature's colors stop, in the data's units (TPM, not the log10 it's colored
   * in), so a link reads as the legend does. Null for the default, the middle 96% of samples.
   */
  range: [number, number] | null;
};

export const DEFAULT_STATE: ExplorerState = {
  ome: "ATAC",
  method: "PCA",
  x: 1,
  y: 2,
  color: "site",
  feature: null,
  shape: NO_SHAPE,
  hidden: {},
  hideQc: false,
  range: null,
};

const QC_HIDE_VALUE = "qc";

/** The feature, if it's shaped like one of the ome's. Checked against the ome, not the coloring, so it survives a change of coloring. */
const featureFor = (ome: ExplorerOme, feature: string | null): string | null => {
  const kind = OME_CAPABILITIES[ome].feature;
  return kind !== null && isFeatureId(kind, feature) ? feature : null;
};

/**
 * Brings a state inside what its ome supports, on every read and write, so hand-edited links and
 * ome switches land somewhere valid: UMAP falls back to PCA, an unoffered coloring to site, an
 * unoffered shape to none, and a PC on both axes moves off y.
 */
export const normalize = (state: ExplorerState): ExplorerState => {
  const color = offersColor(state.ome, state.color) ? state.color : DEFAULT_STATE.color;
  return {
    ...state,
    method: state.method === "UMAP" && !OME_CAPABILITIES[state.ome].umap ? "PCA" : state.method,
    color,
    feature: featureFor(state.ome, state.feature),
    shape: shapeFieldsFor(state.ome).some(({ key }) => key === state.shape) ? state.shape : NO_SHAPE,
    y: state.y === state.x ? (state.x === 1 ? 2 : 1) : state.y,
    range: isContinuous(color) ? state.range : null,
  };
};

/** Drops the color range when the ome, coloring or feature changes: it only meant something for the last one. */
export const forgetStaleRange = (current: ExplorerState, next: ExplorerState): ExplorerState =>
  next.ome !== current.ome || next.color !== current.color || next.feature !== current.feature
    ? { ...next, range: null }
    : next;

type ReadableParams = {
  get(name: string): string | null;
  getAll(name: string): string[];
};

const parsePc = (raw: string | null, fallback: number) => {
  const pc = Number(raw);
  return raw !== null && Number.isInteger(pc) && pc >= 1 && pc <= PC_COUNT ? pc : fallback;
};

/**
 * A bound to four significant figures, rounded outward - down for the low end, up for the high - so
 * a range that took in every sample still does when read back from a link.
 */
const roundOutward = (bound: number, round: (value: number) => number) => {
  if (bound === 0) return 0;
  const step = 10 ** (Math.floor(Math.log10(Math.abs(bound))) - 3);
  // The nudge keeps a bound already on the grid from stepping off it through float error.
  const nudge = round === Math.floor ? 1e-9 : -1e-9;
  return Number((round(bound / step + nudge) * step).toPrecision(4));
};

/** Two finite numbers, low first. */
const parseRange = (raw: string | null): [number, number] | null => {
  const bounds = raw?.split(",").map(Number);
  return bounds?.length === 2 && bounds.every(Number.isFinite) && bounds[0] < bounds[1] ? [bounds[0], bounds[1]] : null;
};

/** Reads a state out of search params. Anything unrecognized falls back to its default rather than failing. */
export const parseState = (params: ReadableParams): ExplorerState => {
  const color = params.get("color");
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
    // Only its shape is checked (by normalize); one the data doesn't have is reported on the plot.
    feature: params.get("feature"),
    shape: isShapeBy(shape) ? shape : DEFAULT_STATE.shape,
    hidden,
    hideQc,
    range: parseRange(params.get("range")),
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
  if (state.feature !== null) params.set("feature", state.feature);
  if (state.shape !== DEFAULT_STATE.shape) params.set("shape", state.shape);

  for (const [field, values] of Object.entries(state.hidden).sort(([a], [b]) => a.localeCompare(b))) {
    for (const value of [...new Set(values)].sort()) params.append("hide", `${field}:${value}`);
  }
  if (state.hideQc) params.append("hide", QC_HIDE_VALUE);
  if (state.range) {
    const [low, high] = state.range;
    params.set("range", `${roundOutward(low, Math.floor)},${roundOutward(high, Math.ceil)}`);
  }

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

/** Moves to another ome, dropping the feature: one ome's features mean nothing on another. */
export const switchOme = (state: ExplorerState, ome: ExplorerOme): ExplorerState =>
  ome === state.ome ? state : { ...state, ome, feature: null };
