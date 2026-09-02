/**
 * The reference panel's population vocabularies: what each code means, and - for
 * the super populations - how it is drawn.
 *
 * These are 1000G+HGDP and gnomAD conventions rather than MOHD ones, so they stay
 * in this folder rather than in src/common: nothing else in the app carries a
 * population code. Both maps cover every value the API returns, so neither needs
 * an "Unknown" entry - the two fields are populated for all 3,400 reference
 * samples, and only ever null on the MOHD rows, which are plotted separately and
 * cannot be colored by them.
 */

/** 1000G+HGDP super populations. */
export const SUPERPOP_LABELS: Record<string, string> = {
  AFR: "African",
  AMR: "Admixed American",
  CSA: "Central/South Asian",
  EAS: "East Asian",
  EUR: "European",
  MID: "Middle Eastern",
  OCE: "Oceanian",
};

/**
 * gnomAD populations. A separate vocabulary rather than a relabelling of the one
 * above: `fin` and `nfe` split EUR between them, and `oth` appears under all
 * seven super populations. That last is why it reads "Remaining", following
 * gnomAD v4 - it is the bucket for samples that matched no group, and "Other"
 * would put it on the legend as though it were one.
 */
export const GNOMAD_POP_LABELS: Record<string, string> = {
  afr: "African/African American",
  amr: "Admixed American",
  eas: "East Asian",
  fin: "European (Finnish)",
  mid: "Middle Eastern",
  nfe: "European (non-Finnish)",
  oth: "Remaining",
  sas: "South Asian",
};

/**
 * Super population colors (ColorBrewer Set1).
 *
 * Beside the labels so that a population code is described in one place, and out
 * of the shared color map for the same reason the labels are: it is a
 * reference-panel convention, not one this app sets. fields.ts wires it into its
 * per-field palette table.
 */
export const SUPERPOP_COLORS: Record<string, string> = {
  AFR: "#984EA3",
  AMR: "#E41A1C",
  CSA: "#FF7F00",
  EAS: "#4DAF4A",
  EUR: "#377EB8",
  MID: "#A65628",
  OCE: "#999999",
};
