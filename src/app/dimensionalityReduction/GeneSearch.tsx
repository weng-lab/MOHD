"use client";

import { GenomeSearch, type Result } from "@weng-lab/ui-components";

const ASSEMBLY = "GRCh38";

/**
 * The GENCODE release the RNA quantification was built on, so the search offers the genes it can
 * actually answer for. Only the id is taken from a result, and the API is asked for it without its
 * version, so this deciding which version a result carries costs nothing downstream.
 */
const GENE_VERSION = 49;

/**
 * GenomeSearch describes a gene with a title and a free-text description, and puts the Ensembl id
 * it looked up in that description rather than in a field of its own - one line per version asked
 * for. One version is asked for here, so exactly one id is in there to find.
 *
 * The version suffix is dropped: what names the gene is the ENSG, and the suffix is a property of
 * the release, which the API is left to reconcile.
 */
const ENSEMBL_ID = /ENSG\d+/;

export const geneIdOf = (result: Result): string | null => result.description?.match(ENSEMBL_ID)?.[0] ?? null;

/** Nothing left for the submit button to do once a click applies the gene. */
const NoButton = () => null;

export type GeneSearchProps = {
  /** Called with an unversioned Ensembl id when a gene is chosen. */
  onSelect: (geneId: string) => void;
};

/**
 * Picks the gene the plot is colored by.
 *
 * Applied on the click that chooses it rather than on a second click of a submit button: the
 * choice only recolors the plot beside it, which is cheap to change again and reversible by
 * choosing something else.
 */
const GeneSearch = ({ onSelect }: GeneSearchProps) => (
  <GenomeSearch
    size="small"
    assembly={ASSEMBLY}
    geneVersion={GENE_VERSION}
    graphqlUrl="/api/screen-graphql"
    queries={["Gene"]}
    limit={5}
    onResultSelect={(result) => {
      // A null means the input was emptied, which is how a reader starts typing the next gene -
      // clearing the coloring there would blank the plot between the first keystroke and the choice.
      if (!result) return;
      const id = geneIdOf(result);
      if (id) onSelect(id);
    }}
    slots={{ button: NoButton }}
    slotProps={{
      input: { label: "Gene", size: "small" },
      paper: { elevation: 3 },
    }}
  />
);

export default GeneSearch;
