"use client";

import { CircularProgress, Stack, Typography } from "@mui/material";
import { EXPRESSION_NOTE, expressionDefinition, type GeneExpression } from "./expression";
import MetricLegend from "./MetricLegend";
import type { MetricScale } from "./metrics";

export type ExpressionLegendProps = {
  gene: GeneExpression;
  /** Across log10(TPM + 1), which is what the colorbar's ends are written back out of. */
  scale: MetricScale | null;
  /** Samples in focus the gene has no value for. */
  missing: number;
  /** The hovered sample's value, in log10 as the scale is. */
  hovered: number | null;
};

/**
 * The colorbar for gene expression, plus the states a fetched coloring has that a metric does not:
 * no gene picked, in flight, failed, or a gene the quantification does not carry.
 *
 * They read as a line of text where the bar would be, rather than as an empty plot with nothing to
 * say about it - an all-grey plot is what each of these four looks like, and they mean very
 * different things.
 */
const ExpressionLegend = ({ gene, scale, missing, hovered }: ExpressionLegendProps) => {
  if (gene.status === "ready") {
    return (
      <MetricLegend
        metric={expressionDefinition(gene)}
        note={EXPRESSION_NOTE}
        scale={scale}
        missing={missing}
        hovered={hovered}
      />
    );
  }

  const message = {
    idle: "Search for a gene to color samples by how much of it they express.",
    loading: "Loading expression…",
    // Named by id, not by name: the query that would have given us a name is the one that failed.
    missing: `No expression recorded for ${gene.id}.`,
    error: "Could not load expression for this gene.",
  }[gene.status];

  return (
    <Stack direction="row" alignItems="center" gap={1} minHeight={24} flexShrink={0}>
      {gene.status === "loading" && <CircularProgress size={12} aria-hidden />}
      <Typography variant="caption" color={gene.status === "error" ? "error" : "text.secondary"}>
        {message}
      </Typography>
    </Stack>
  );
};

export default ExpressionLegend;
