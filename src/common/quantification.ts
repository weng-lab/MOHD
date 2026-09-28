/** Quantification values as the heatmaps and the explorer color and write them. */

/**
 * A mass-spec value, compact and to four figures ("142M"): these run from single digits to hundreds
 * of millions. Fixed locale, so server and client render the same.
 */
export const formatValue = (value: number) =>
  value.toLocaleString("en-US", { notation: "compact", maximumSignificantDigits: 4 });

/** An end of a color scale, which falls between values, so only its magnitude matters. */
export const formatValueBound = (value: number) =>
  value.toLocaleString("en-US", { notation: "compact", maximumSignificantDigits: 2 });

/**
 * Colored on log10(value + 1): one feature's values span orders of magnitude, which a linear ramp
 * would crush to one end. The + 1 keeps zeros - 22% of metallomics, and real measurements - at the
 * bottom of the ramp rather than at -Infinity.
 */
export const toLogValue = (value: number) => Math.log10(value + 1);

export const fromLogValue = (log: number) => 10 ** log - 1;
