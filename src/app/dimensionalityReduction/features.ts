/**
 * Coloring the plot by one feature's quantification: a gene's expression on RNA, and on the
 * mass-spec omes one lipid's, metabolite's or metal's measurement.
 *
 * Continuous like the metrics in metrics.ts, and drawn on the same ramp, but fetched rather than
 * carried on the row: each ome holds a value per feature per sample, far more than a page can ship,
 * so the one feature a reader picks is fetched on its own - see useFeature.
 */

import type { ContinuousDefinition } from "./metrics";
import type { ExplorerOme } from "./omes";

/** What ?color= carries while a feature colors the plot. Which feature is ?feature=, alongside it. */
export const FEATURE_COLOR = "feature";

export type FeatureColor = typeof FEATURE_COLOR;

/** What one feature is on an ome that has them. */
export type FeatureKind = "gene" | "lipid" | "metabolite" | "metal";

/**
 * The omes whose features are the columns of a quantification matrix. RNA's genes are searched for
 * and fetched one at a time from the API; the API only serves these as a whole matrix, which the
 * server slices - see /api/quantification.
 */
export const MASS_SPEC_OMES = ["lipidomics", "metabolomics", "metallomics"] as const satisfies readonly ExplorerOme[];

export type MassSpecOme = (typeof MASS_SPEC_OMES)[number];

export const isMassSpecOme = (value: string | null): value is MassSpecOme =>
  MASS_SPEC_OMES.some((ome) => ome === value);

/**
 * A sample's own value, to four figures: enough to tell two samples apart, and short where these
 * run from single digits (a trace metal) to hundreds of millions (a lipid). Compact, so "142M" rather
 * than a row of zeros. Fixed locale: this renders during SSR too, and the browser's own would write
 * the number differently and fail hydration.
 */
const formatValue = (value: number) =>
  value.toLocaleString("en-US", { notation: "compact", maximumSignificantDigits: 4 });

/**
 * An end of the color scale. It falls between two samples' values rather than on one of them, so it
 * is rounded to a magnitude - across a range this wide nothing finer would tell the reader anything.
 */
const formatValueBound = (value: number) =>
  value.toLocaleString("en-US", { notation: "compact", maximumSignificantDigits: 2 });

/** A sample's TPM, to the precision the API reports. */
export const formatTpm = (tpm: number) => `${tpm.toLocaleString("en-US", { maximumFractionDigits: 2 })} TPM`;

const formatTpmBound = (tpm: number) => `${tpm.toLocaleString("en-US", { maximumSignificantDigits: 2 })} TPM`;

type FeatureKindDefinition = {
  /** The item in the color select. */
  option: string;
  /** What one feature is called, in the picker's label and the legend's messages. */
  noun: string;
  /** What is measured of it, after its name: "CFH expression", "Metformin abundance". */
  measure: string;
  /** The legend's line before a feature is picked. */
  prompt: string;
  /** What the log is taken of, for the colorbar's note. */
  unit: string;
  format: (value: number) => string;
  formatBound: (value: number) => string;
};

/**
 * Worded as the ome pages word them - lipid abundance, metal concentrations. The mass-spec values
 * carry no unit: the API does not name one, and the heatmaps show the bare number.
 */
export const FEATURE_KINDS: Record<FeatureKind, FeatureKindDefinition> = {
  gene: {
    option: "Gene expression",
    noun: "gene",
    measure: "expression",
    prompt: "Search for a gene to color samples by how much of it they express.",
    unit: "TPM",
    format: formatTpm,
    formatBound: formatTpmBound,
  },
  lipid: {
    option: "Lipid abundance",
    noun: "lipid",
    measure: "abundance",
    prompt: "Pick a lipid to color samples by its abundance.",
    unit: "value",
    format: formatValue,
    formatBound: formatValueBound,
  },
  metabolite: {
    option: "Metabolite abundance",
    noun: "metabolite",
    measure: "abundance",
    prompt: "Pick a metabolite to color samples by its abundance.",
    unit: "value",
    format: formatValue,
    formatBound: formatValueBound,
  },
  metal: {
    option: "Metal concentration",
    noun: "metal",
    measure: "concentration",
    prompt: "Pick a metal to color samples by its concentration.",
    unit: "value",
    format: formatValue,
    formatBound: formatValueBound,
  },
};

/**
 * An Ensembl gene id with no version suffix, which is what ?feature= carries on RNA and what the API
 * is asked to match on. The suffix moves with each GENCODE release, so a link that pinned one would
 * start finding nothing the first time the quantification was rebuilt.
 */
const GENE_ID = /^ENSG\d+$/;

/** Longer than any name the mass-spec omes hold, which top out under 50 characters. */
const MAX_NAME_LENGTH = 200;

/**
 * Whether a value is shaped like one of this kind's features - not whether the data has it. A gene
 * is an unversioned Ensembl id; a mass-spec feature is its name, as the data spells it.
 */
export const isFeatureId = (kind: FeatureKind, value: string | null): value is string =>
  value !== null && (kind === "gene" ? GENE_ID.test(value) : value.length > 0 && value.length <= MAX_NAME_LENGTH);

/** One feature a mass-spec ome quantifies, as its picker lists it. */
export type FeatureOption = {
  /** Its name, as the data spells it and ?feature= carries it. Unique within an ome. */
  name: string;
  /** Anything more the data says of it, shown beside the name: a metabolite's ionization mode. */
  detail?: string;
};

/**
 * The heading a feature is listed under, or null where a kind's list is short enough to read whole.
 *
 * A lipid goes under its class - what comes before its first parenthesis, so "TG(52:2) [SIM]" is a
 * TG and "Hex2Cer(d18:1/16:0)" a Hex2Cer. A metal goes under the tab it has on the metallomics
 * heatmap: normalized to urine creatinine where its name says so, a base metal otherwise, the
 * creatinine measurement itself included.
 */
export const featureGroup = (kind: FeatureKind, { name }: FeatureOption): string | null => {
  switch (kind) {
    case "lipid":
      return name.split("(")[0].trim();
    case "metal":
      return name.endsWith("_UCr") ? "UCr-Normalized" : "Base Metals";
    default:
      return null;
  }
};

/** In the order a picker lists them, which is what grouping them needs: by heading, then by name. */
export const sortFeatures = (kind: FeatureKind, options: FeatureOption[]): FeatureOption[] =>
  [...options].sort(
    (a, b) =>
      (featureGroup(kind, a) ?? "").localeCompare(featureGroup(kind, b) ?? "", "en", { numeric: true }) ||
      a.name.localeCompare(b.name, "en", { numeric: true })
  );

/** One feature's values, as /api/quantification sends them: pairs, so they turn straight into a Map. */
export type FeatureSlice = {
  name: string;
  /** Every sample with a value. A sample with none is left out rather than sent as null. */
  values: [sampleId: string, value: number][];
};

export type FeatureStatus =
  /** No feature picked yet. */
  | "idle"
  | "loading"
  /** Values in hand. */
  | "ready"
  /** The data knows no such feature. */
  | "missing"
  | "error";

export type FeatureValues = {
  /** The feature asked for, as ?feature= carries it. Null while none is picked. */
  id: string | null;
  /** The feature as the data names it - "CFH" for a gene's id - once its values have come back. */
  name: string | null;
  /**
   * Raw values by sample_id, untransformed, so a tooltip can quote the data's own number. A sample
   * with no value is left out of the map rather than held as null, so "not in the map" is the single
   * way a sample has no value, however it came to have none.
   */
  values: ReadonlyMap<string, number> | null;
  status: FeatureStatus;
};

/**
 * Within a single feature, values span orders of magnitude - a gene's TPM runs from a few thousand
 * in the samples that express it to a handful in those that barely do, and metformin from 19 in
 * most samples to 34 million in the few that take it - so a ramp stretched across the raw values
 * would leave nearly every sample at one end of it. It is stretched across log10(value + 1) instead.
 * The + 1 is what holds a zero at zero rather than at negative infinity: 22% of metallomics values
 * are exactly 0, and they are measurements, painted at the bottom of the ramp like any other.
 */
export const toLogValue = (value: number) => Math.log10(value + 1);

/** Back out of the ramp's units into the data's own, for a label or a link. */
export const fromLogValue = (log: number) => 10 ** log - 1;

/** How the plot names its coloring, with something honest to say before the feature has a name. */
export const featureLabel = (kind: FeatureKind, { name }: FeatureValues) =>
  name ? `${name} ${FEATURE_KINDS[kind].measure}` : FEATURE_KINDS[kind].option.toLowerCase();

/** The colorbar's name, and how it writes a value: the scale is log10, the reader is shown the raw value. */
export const featureDefinition = (kind: FeatureKind, feature: FeatureValues): ContinuousDefinition => ({
  label: featureLabel(kind, feature),
  format: (log) => FEATURE_KINDS[kind].formatBound(fromLogValue(log)),
  formatValue: (log) => FEATURE_KINDS[kind].format(fromLogValue(log)),
});

/** What a feature's values go through before they are colored. The colorbar adds where its colors stop. */
export const featureTransform = (kind: FeatureKind) => `log10(${FEATURE_KINDS[kind].unit} + 1)`;
