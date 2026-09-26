/**
 * The arithmetic behind a colorbar: where a value sits along the bar, how many values fall in each
 * stretch of it, and the ranges a reader can set its colors to span.
 *
 * Everything here takes values sorted ascending and answers by bisecting them rather than walking
 * them, so a heatmap's hundreds of thousands of cells cost a histogram no more than a plot's few
 * hundred points.
 */

/** Where the colors stop, in the units the ramp is drawn in. Values beyond take the end colors. */
export type ColorRange = [low: number, high: number];

/** A color stop, `at` from 0 at the low end of the ramp to 1 at its high end. */
export type RampStop = { at: number; color: string };

/**
 * Sequential runs one way, low to high. Diverging runs out both ways from a neutral 0, so its range
 * stays symmetric - one number, ±limit - and moving either end moves both.
 */
export type RampKind = "sequential" | "diverging";

/** A stretch of the bar, from 0 at its low end to 1 at its high end. */
export type RampRange = { from: number; to: number };

/** A range the editor offers in one click. */
export type RangePreset = { label: string; range: ColorRange };

type Sorted = ArrayLike<number>;

/** How many values lie below x. */
export const lowerBound = (sorted: Sorted, x: number) => {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

/** How many values lie at or below x. */
export const upperBound = (sorted: Sorted, x: number) => {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

/** Linear interpolation between closest ranks - numpy's default, so it agrees with a quick check in Python. */
export const percentile = (sorted: Sorted, p: number) => {
  const rank = ((sorted.length - 1) * p) / 100;
  const below = Math.floor(rank);
  const above = Math.min(below + 1, sorted.length - 1);
  return sorted[below] + (sorted[above] - sorted[below]) * (rank - below);
};

/** Colors spaced evenly along the ramp, as the heatmap library spaces them. */
export const evenStops = (colors: readonly string[]): RampStop[] =>
  colors.map((color, i) => ({ at: i / (colors.length - 1), color }));

/** Where values sit along a bar, and which value sits at each place. */
export type BarAxis = {
  /** A value's place along the bar, from 0 at its low end to 1 at its high end. */
  toT: (value: number) => number;
  /** The value at a place along the bar. */
  fromT: (t: number) => number;
  /** Places where the scale changes pace, which the bar marks with a gap. */
  breaks: number[];
};

const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);

/**
 * The bar spanning the colors' range, with anything beyond held at its ends - where its color comes
 * from. The compact legend's axis: its ends are where the colors stop, so a value's place on it and
 * its color always agree.
 */
export const rangeAxis = ([low, high]: ColorRange): BarAxis => {
  const span = high - low;
  return {
    toT: (value) => (span > 0 ? clamp01((value - low) / span) : 0.5),
    fromT: (t) => low + t * span,
    breaks: [],
  };
};

/** Share of the bar each squeezed tail takes, where it has one. */
const TAIL_SHARE = 0.16;

/**
 * The bar spanning every value, for setting where the colors stop.
 *
 * Linear across `core` - the default range, where nearly every value lies - and logarithmic in the
 * tails beyond it, which are squeezed into the last 16% at either end: a cytometry "logicle" axis in
 * all but name. Linear across the whole extent would hand most of the bar to a handful of values -
 * heatmap z-scores run to ±23 while 99% of cells lie within ±3 - and leave the bulk too cramped to
 * set a range in. The axis stays put whatever the range is, so a handle stays under the cursor
 * while it is dragged. A diverging axis is symmetric, so 0 stays in the middle.
 */
export const squeezedAxis = (core: ColorRange, extent: ColorRange, kind: RampKind): BarAxis => {
  const [low, high] = core;
  const reach = Math.max(-extent[0], extent[1], high);
  const [lowest, highest] = kind === "diverging" ? [-reach, reach] : extent;
  const hasLowTail = lowest < low;
  const hasHighTail = highest > high;
  const lowShare = hasLowTail ? TAIL_SHARE : 0;
  const highShare = hasHighTail ? TAIL_SHARE : 0;
  const coreShare = 1 - lowShare - highShare;
  // The tails' softness: a tail shorter than this stays near-linear, a longer one compresses.
  const unit = (high - low) / 10 || 1;
  const lowLength = Math.log1p((low - lowest) / unit);
  const highLength = Math.log1p((highest - high) / unit);

  return {
    toT: (value) => {
      if (value < low) return hasLowTail ? clamp01(lowShare * (1 - Math.log1p((low - value) / unit) / lowLength)) : 0;
      if (value > high)
        return hasHighTail ? clamp01(1 - highShare + (highShare * Math.log1p((value - high) / unit)) / highLength) : 1;
      return high > low ? lowShare + (coreShare * (value - low)) / (high - low) : 0.5;
    },
    fromT: (t) => {
      if (t < lowShare) return low - unit * Math.expm1((1 - t / lowShare) * lowLength);
      if (t > 1 - highShare) return high + unit * Math.expm1(((t - (1 - highShare)) / highShare) * highLength);
      return low + ((t - lowShare) / coreShare) * (high - low);
    },
    breaks: [lowShare, 1 - highShare].filter((b) => b > 0 && b < 1),
  };
};

/** How many values fall in each of `bins` equal stretches of the bar, found at each stretch's edge. */
export const histogram = (sorted: Sorted, axis: BarAxis, bins: number): number[] => {
  const counts = new Array<number>(bins);
  let previous = 0;
  for (let k = 0; k < bins; k++) {
    const next = k === bins - 1 ? sorted.length : lowerBound(sorted, axis.fromT((k + 1) / bins));
    counts[k] = next - previous;
    previous = next;
  }
  return counts;
};

/**
 * The values a stretch of the bar takes in. At either end it reaches past the range to take in the
 * values held at that end's color, so a window at the end of the bar lights every point wearing it.
 */
export const valuesIn = (axis: BarAxis, { from, to }: RampRange): ColorRange => [
  from <= 0 ? -Infinity : axis.fromT(from),
  to >= 1 ? Infinity : axis.fromT(to),
];

/** How many values lie in a range, and the lowest and highest of them - the true ones, past any clamp. */
export const summarize = (sorted: Sorted, [low, high]: ColorRange) => {
  const first = lowerBound(sorted, low);
  const end = upperBound(sorted, high);
  const count = end - first;
  return { count, lowest: count ? sorted[first] : null, highest: count ? sorted[end - 1] : null };
};

/** How many values lie beyond a range, and so take its end colors. */
export const countBeyond = (sorted: Sorted, [low, high]: ColorRange) =>
  lowerBound(sorted, low) + (sorted.length - upperBound(sorted, high));

/**
 * How much of the bar a sweep takes in. Wide enough that the window holds a visible handful of
 * values most places along it, narrow enough that a sweep end to end passes through colors that are
 * plainly different.
 */
export const RANGE_WIDTH = 0.15;

/**
 * The window centred on a place along the bar, slid inward at either end rather than cut short, so it
 * spans the same share of the bar wherever the cursor is.
 */
export const rangeAt = (t: number): RampRange => {
  const from = Math.min(Math.max(t - RANGE_WIDTH / 2, 0), 1 - RANGE_WIDTH);
  return { from, to: from + RANGE_WIDTH };
};

/** The middle 90%, 96% and 98% of the values, and all of them. 96% is the default the colorbars start at. */
export const percentilePresets = (sorted: Sorted): RangePreset[] => [
  { label: "5–95%", range: [percentile(sorted, 5), percentile(sorted, 95)] },
  { label: "2–98%", range: [percentile(sorted, 2), percentile(sorted, 98)] },
  { label: "1–99%", range: [percentile(sorted, 1), percentile(sorted, 99)] },
  { label: "All", range: [sorted[0], sorted[sorted.length - 1]] },
];

/**
 * A symmetric limit, rounded up to a tenth, so "All" takes in every value rather than all but the
 * float noise at the far end.
 */
export const reachOf = (sorted: Sorted) => Math.ceil(Math.max(-sorted[0], sorted[sorted.length - 1]) * 10) / 10;

/** ±2, ±3, ±5 and ±10 where the values reach past them, and all of them. */
export const symmetricPresets = (reach: number): RangePreset[] => [
  ...[2, 3, 5, 10]
    .filter((limit) => limit < reach)
    .map((limit): RangePreset => ({ label: `±${limit}`, range: [-limit, limit] })),
  { label: "All", range: [-reach, reach] },
];

/**
 * Rounds a dragged diverging limit to a figure worth writing down: tenths below 5, halves below 10,
 * whole numbers beyond. Dragging through the squeezed tail moves several units a pixel, where a
 * tenth would be false precision.
 */
export const snapLimit = (limit: number) =>
  limit < 5 ? Math.round(limit * 10) / 10 : limit < 10 ? Math.round(limit * 2) / 2 : Math.round(limit);

/**
 * Whether two ranges are the same to within half a percent of their span: past the rounding a link
 * applies, well short of any difference a reader would see on the bar.
 */
export const sameRange = (a: ColorRange, b: ColorRange) => {
  const tolerance = Math.max(Math.abs(a[1] - a[0]), Math.abs(b[1] - b[0])) * 5e-3;
  return Math.abs(a[0] - b[0]) <= tolerance && Math.abs(a[1] - b[1]) <= tolerance;
};

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** The color a ramp of hex stops has at `s`, from 0 at its low end to 1 at its high end. */
export const colorAt = (stops: readonly RampStop[], s: number): string => {
  const t = clamp01(s);
  // The stops may be unevenly placed, so find the pair t falls between rather than indexing by step.
  const upper = Math.max(
    stops.findIndex(({ at }) => at >= t),
    1
  );
  const [from, to] = [stops[upper - 1], stops[upper]];
  const mix = to.at > from.at ? (t - from.at) / (to.at - from.at) : 0;
  const [start, end] = [toRgb(from.color), toRgb(to.color)];
  return `rgb(${start.map((channel, i) => Math.round(channel + (end[i] - channel) * mix)).join(",")})`;
};

/**
 * A count as a share of a total, never rounded to a misleading zero: 381 of 845,208 cells is "<0.1%",
 * not "0.0%". Tenths below 10%, whole percents above.
 */
export const formatShare = (count: number, total: number) => {
  const share = (100 * count) / Math.max(total, 1);
  return count === 0 ? "0%" : share < 0.1 ? "<0.1%" : `${share.toFixed(share < 10 ? 1 : 0)}%`;
};
