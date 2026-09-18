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

import { NEUTRAL_MID } from "@/common/components/plotDimming";

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
 * Super population colors, taken from the consortium's Figure 3.
 *
 * These are the values the published PCA scatter (panel a) draws its points with,
 * read off the figure itself rather than approximated, so a reader moving between
 * the paper and this page sees the same color on the same cluster. Note the
 * figure's own legend chips and its panel (b) bars use slightly softer versions
 * of the same seven hues; panel (a) is the one copied here because this page is
 * the same chart - a PCA scatter of these populations - and one set has to serve
 * both the points and the legend.
 *
 * Beside the labels so that a population code is described in one place, and out
 * of the shared color map for the same reason the labels are: it is a
 * reference-panel convention, not one this app sets. fields.ts wires it into its
 * per-field palette table.
 */
export const SUPERPOP_COLORS: Record<string, string> = {
  AFR: "#15607A",
  AMR: "#FCA800",
  CSA: "#49B5DB",
  EAS: "#AA3766",
  EUR: "#09BB9F",
  MID: "#6A3D9A",
  OCE: "#FFDD57",
};

/**
 * gnomAD population colors, derived from SUPERPOP_COLORS.
 *
 * Each gnomAD population is drawn in the color of the continental group it
 * describes, because it describes the same reference samples: `afr` is Africa's
 * teal, `sas` is Central/South Asia's blue, and so on. Coloring the two
 * vocabularies as one system is accurate here, and it is also what keeps the
 * page's color budget solvable - the reference plot spends no colors beyond the
 * seven above, which leaves room for the MOHD plot to stay clear of all of them.
 *
 * Two entries are not a straight reuse:
 *
 * `fin` and `nfe` split EUR between them, so they are two shades of Europe's
 * green rather than two unrelated colors. They sit closer together than any other
 * pair on this page (~13 ΔE2000, against the ~15 kept everywhere else) and that
 * is deliberate: the resemblance is real, and the legend should show it while
 * still telling them apart.
 *
 * `oth` ("Remaining") is neutral rather than any continental color - it is the
 * bucket for samples that matched no group, and lending it one group's hue would
 * say something false about what is in it. It is the one place a resemblance
 * across the two plots is wanted rather than avoided: it sits in the same grey
 * family as the MOHD legend's "Unknown" and its privacy bin, because all three
 * mean "no named group here" and nothing is implied by reading them alike. They
 * never share a legend, so only the cross-plot resemblance is in question.
 *
 * It takes the middle step of the shared neutral scale rather than a grey of its
 * own, which its old #9AA0A6 had stopped being: filtered-out points are drawn
 * pale grey now, and a stack of them came within 12 ΔE2000 of it. From the
 * middle step the nearest reference color is Africa's teal, 20 away.
 */
export const GNOMAD_POP_COLORS: Record<string, string> = {
  afr: SUPERPOP_COLORS.AFR,
  amr: SUPERPOP_COLORS.AMR,
  eas: SUPERPOP_COLORS.EAS,
  fin: "#0E8F7A",
  mid: SUPERPOP_COLORS.MID,
  nfe: SUPERPOP_COLORS.EUR,
  oth: NEUTRAL_MID,
  sas: SUPERPOP_COLORS.CSA,
};
