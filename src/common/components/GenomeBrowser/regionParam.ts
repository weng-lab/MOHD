import { hg38, normalizeRegion, parseRegion, type GenomicRegion } from "@weng-lab/genomebrowser";

/** The query parameter that opens a genome browser on a region, written chromosome:start-end. */
export const REGION_PARAM = "region";

/** The share of a gene's length added to each side, as SCREEN's genome browser pads genes. */
const GENE_PADDING = 0.2;

/** A gene's locus with room on either side, so the gene doesn't run edge to edge. */
export const padGeneRegion = ({ chromosome, start, end }: GenomicRegion): GenomicRegion => {
  const padding = Math.floor((end - start) * GENE_PADDING);
  // The end may now overrun the chromosome; parseRegionParam clamps it when the link is followed.
  return { chromosome, start: Math.max(0, start - padding), end: end + padding };
};

export const formatRegion = ({ chromosome, start, end }: GenomicRegion) => `${chromosome}:${start}-${end}`;

/** The main genome browser, opened on a region. */
export const genomeBrowserHref = (region: GenomicRegion) => `/genomeBrowser?${REGION_PARAM}=${formatRegion(region)}`;

/**
 * The region a link asks for, clamped to its chromosome, or null when the parameter is missing or
 * names no hg38 region, in which case the browser opens where it would have anyway.
 */
export const parseRegionParam = (value: string | null): GenomicRegion | null => {
  if (!value) return null;
  try {
    const result = normalizeRegion(parseRegion(value), hg38);
    return result.ok ? result.region : null;
  } catch {
    // parseRegion throws on anything that isn't chromosome:start-end.
    return null;
  }
};
