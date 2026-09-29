"use client";

import { GenomeSearch, type Result } from "@weng-lab/ui-components";

const ASSEMBLY = "GRCh38";

/** The GENCODE release the RNA quantification was built on, so the search offers genes it has. */
const GENE_VERSION = 49;

/**
 * GenomeSearch puts a gene's Ensembl id only in its free-text description, one line per requested
 * version - one here. Taken without its version suffix.
 */
const ENSEMBL_ID = /ENSG\d+/;

const geneIdOf = (result: Result): string | null => result.description?.match(ENSEMBL_ID)?.[0] ?? null;

/** A click applies the gene, so there's no submit button. */
const NoButton = () => null;

export type GeneSearchProps = {
  /** Called with an unversioned Ensembl id when a gene is chosen. */
  onSelect: (geneId: string) => void;
};

/** Picks the gene the plot is colored by, applied as soon as it's chosen. */
const GeneSearch = ({ onSelect }: GeneSearchProps) => (
  <GenomeSearch
    size="small"
    assembly={ASSEMBLY}
    geneVersion={GENE_VERSION}
    graphqlUrl="/api/screen-graphql"
    queries={["Gene"]}
    limit={5}
    onResultSelect={(result) => {
      // Null when the input is emptied to type the next gene; ignored, so the plot doesn't blank meanwhile.
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
