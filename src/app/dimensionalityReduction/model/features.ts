/**
 * Coloring the plot by one feature's quantification: a gene's expression on RNA, or one lipid's,
 * metabolite's or metal's measurement on the mass-spec omes. Drawn on the metrics' ramp, but fetched
 * a feature at a time rather than carried on the row - see useFeature.
 */

import type { ContinuousDefinition } from "./metrics";
import type { ExplorerOme } from "./omes";

/**
 * What ?color= carries while a feature colors the plot; ?feature= says which. The mass-spec omes
 * share "feature", so the coloring carries over between them; RNA's is "expression", so moving to
 * or from RNA falls back to site rather than landing on an empty picker of an unrelated kind.
 */
export const FEATURE_COLORS = ["feature", "expression"] as const;

export type FeatureColor = (typeof FEATURE_COLORS)[number];

export const isFeatureColor = (value: string | null): value is FeatureColor =>
  FEATURE_COLORS.some((color) => color === value);

export type FeatureKind = "gene" | "lipid" | "metabolite" | "metal";

/** The omes the API serves only as a whole matrix, which the server slices - see /api/quantification. */
const MASS_SPEC_OMES = ["lipidomics", "metabolomics", "metallomics"] as const satisfies readonly ExplorerOme[];

export type MassSpecOme = (typeof MASS_SPEC_OMES)[number];

export const isMassSpecOme = (value: string | null): value is MassSpecOme =>
  MASS_SPEC_OMES.some((ome) => ome === value);

/**
 * A mass-spec value, compact and to four figures ("142M"): these run from single digits to hundreds
 * of millions. Fixed locale, so server and client render the same.
 */
export const formatValue = (value: number) =>
  value.toLocaleString("en-US", { notation: "compact", maximumSignificantDigits: 4 });

/** An end of a color scale, which falls between values, so only its magnitude matters. */
export const formatValueBound = (value: number) =>
  value.toLocaleString("en-US", { notation: "compact", maximumSignificantDigits: 2 });

const formatTpm = (tpm: number) => `${tpm.toLocaleString("en-US", { maximumFractionDigits: 2 })} TPM`;

const formatTpmBound = (tpm: number) => `${tpm.toLocaleString("en-US", { maximumSignificantDigits: 2 })} TPM`;

type FeatureKindDefinition = {
  /** What ?color= carries while one of these colors the plot. */
  color: FeatureColor;
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

/** Worded as the ome pages word them. The mass-spec values have no unit in the API. */
export const FEATURE_KINDS: Record<FeatureKind, FeatureKindDefinition> = {
  gene: {
    color: "expression",
    option: "Gene expression",
    noun: "gene",
    measure: "expression",
    prompt: "Search for a gene to color samples by how much of it they express.",
    unit: "TPM",
    format: formatTpm,
    formatBound: formatTpmBound,
  },
  lipid: {
    color: "feature",
    option: "Lipid abundance",
    noun: "lipid",
    measure: "abundance",
    prompt: "Pick a lipid to color samples by its abundance.",
    unit: "value",
    format: formatValue,
    formatBound: formatValueBound,
  },
  metabolite: {
    color: "feature",
    option: "Metabolite abundance",
    noun: "metabolite",
    measure: "abundance",
    prompt: "Pick a metabolite to color samples by its abundance.",
    unit: "value",
    format: formatValue,
    formatBound: formatValueBound,
  },
  metal: {
    color: "feature",
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
 * An Ensembl gene id without its version, which is what ?feature= carries on RNA: the version
 * changes with each GENCODE release, and a link pinned to one would stop matching.
 */
const GENE_ID = /^ENSG\d+$/;

/** Longer than any mass-spec feature name, which top out under 50 characters. */
const MAX_NAME_LENGTH = 200;

/** Whether a value is shaped like one of this kind's features - not whether the data has it. */
export const isFeatureId = (kind: FeatureKind, value: string | null): value is string =>
  value !== null && (kind === "gene" ? GENE_ID.test(value) : value.length > 0 && value.length <= MAX_NAME_LENGTH);

/** One feature a mass-spec ome quantifies, as its picker lists it. */
export type FeatureOption = {
  /** As the data spells it and ?feature= carries it. Unique within an ome. */
  name: string;
  /** Shown beside the name: a metabolite's ionization mode. */
  detail?: string;
};

/**
 * The heading a feature is listed under, or null for a list short enough to read whole. A lipid goes
 * under its class, the text before its first "(" ("TG(52:2) [SIM]" is a TG); a metal under its tab on
 * the metallomics heatmap.
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

/** By heading, then by name, as grouping in the picker needs. */
export const sortFeatures = (kind: FeatureKind, options: FeatureOption[]): FeatureOption[] =>
  [...options].sort(
    (a, b) =>
      (featureGroup(kind, a) ?? "").localeCompare(featureGroup(kind, b) ?? "", "en", { numeric: true }) ||
      a.name.localeCompare(b.name, "en", { numeric: true })
  );

/** One feature's values, as /api/quantification sends them. */
export type FeatureSlice = {
  name: string;
  /** Every sample with a value; a sample with none is left out. */
  values: [sampleId: string, value: number][];
};

export type FeatureStatus =
  /** No feature picked yet. */
  | "idle"
  | "loading"
  | "ready"
  /** The data knows no such feature. */
  | "missing"
  | "error";

export type FeatureValues = {
  /** The feature asked for, as ?feature= carries it. Null while none is picked. */
  id: string | null;
  /** The feature as the data names it - "CFH" for a gene's id - once its values have come back. */
  name: string | null;
  /** Raw values by sample_id. A sample with no value is absent rather than null. */
  values: ReadonlyMap<string, number> | null;
  status: FeatureStatus;
};

/**
 * Colored on log10(value + 1): one feature's values span orders of magnitude, which a linear ramp
 * would crush to one end. The + 1 keeps zeros - 22% of metallomics, and real measurements - at the
 * bottom of the ramp rather than at -Infinity.
 */
export const toLogValue = (value: number) => Math.log10(value + 1);

export const fromLogValue = (log: number) => 10 ** log - 1;

/** How the plot names its coloring, before and after the feature's name is known. */
export const featureLabel = (kind: FeatureKind, { name }: FeatureValues) =>
  name ? `${name} ${FEATURE_KINDS[kind].measure}` : FEATURE_KINDS[kind].option.toLowerCase();

/** The colorbar's label and formatters: it's scaled in log10, but shows raw values. */
export const featureDefinition = (kind: FeatureKind, feature: FeatureValues): ContinuousDefinition => ({
  label: featureLabel(kind, feature),
  format: (log) => FEATURE_KINDS[kind].formatBound(fromLogValue(log)),
  formatValue: (log) => FEATURE_KINDS[kind].format(fromLogValue(log)),
});

/** The transform a feature's values go through before they are colored, for the colorbar's note. */
export const featureTransform = (kind: FeatureKind) => `log10(${FEATURE_KINDS[kind].unit} + 1)`;
