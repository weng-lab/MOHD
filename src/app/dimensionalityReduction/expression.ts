/**
 * Coloring the RNA plot by one gene's expression.
 *
 * Continuous like the metrics in metrics.ts, and drawn on the same ramp, but fetched rather than
 * carried on the row: the expression matrix holds a value per gene per sample, far more than a page
 * can ship, so the one gene a reader picks is queried on its own - see useGeneExpression.
 */

import { CLIP_PERCENTILE, type ContinuousDefinition } from "./metrics";

/** What ?color= carries while a gene colors the plot. Which gene is ?gene=, alongside it. */
export const EXPRESSION_COLOR = "expression";

export type ExpressionColor = typeof EXPRESSION_COLOR;

/**
 * An Ensembl gene id with no version suffix, which is what ?gene= carries and what the API is asked
 * to match on. The suffix moves with each GENCODE release, so a link that pinned one would start
 * finding nothing the first time the quantification was rebuilt.
 */
const GENE_ID = /^ENSG\d+$/;

export const isGeneId = (value: string | null): value is string => value !== null && GENE_ID.test(value);

export type ExpressionStatus =
  /** No gene picked yet. */
  | "idle"
  | "loading"
  /** Values in hand. */
  | "ready"
  /** The API knows no such gene, or does not quantify it. */
  | "missing"
  | "error";

export type GeneExpression = {
  /** The gene asked for, as ?gene= carries it. Null while none is picked. */
  id: string | null;
  /** The gene as the API names it - "CFH" - once the query has answered. */
  name: string | null;
  /** Raw TPM by sample_id, untransformed, so a tooltip can quote the API's own number. */
  values: ReadonlyMap<string, number> | null;
  status: ExpressionStatus;
};

/**
 * Within a single gene, TPM spans several orders of magnitude - a few thousand in the samples that
 * express it against a handful in the samples that barely do - so a ramp stretched across TPM would
 * leave nearly every sample at one end of it. It is stretched across log10(TPM + 1) instead. The
 * + 1 is what holds a sample with no reads at zero rather than at negative infinity.
 */
export const toLogTpm = (tpm: number) => Math.log10(tpm + 1);

const fromLogTpm = (log: number) => 10 ** log - 1;

/**
 * A sample's own value, to the precision the API reports. Fixed locale: this renders during SSR too,
 * and the browser's own would group the thousands differently and fail hydration.
 */
export const formatTpm = (tpm: number) => `${tpm.toLocaleString("en-US", { maximumFractionDigits: 2 })} TPM`;

/**
 * An end of the color scale. It falls between two samples' values rather than on one of them, so it
 * is rounded to a magnitude - across a range this wide nothing finer would tell the reader anything.
 */
const formatTpmBound = (tpm: number) => `${tpm.toLocaleString("en-US", { maximumSignificantDigits: 2 })} TPM`;

/** How the plot names its coloring, with something honest to say before the gene has a name. */
export const expressionLabel = ({ name }: GeneExpression) => (name ? `${name} expression` : "gene expression");

/** The colorbar's name, and how it writes a value: the scale is log10, the reader is shown TPM. */
export const expressionDefinition = (gene: GeneExpression): ContinuousDefinition => ({
  label: expressionLabel(gene),
  format: (log) => formatTpmBound(fromLogTpm(log)),
});

export const EXPRESSION_NOTE = `log10(TPM + 1). Spans the middle ${100 - 2 * CLIP_PERCENTILE}% of samples, so a few extreme values don't wash out the rest`;
