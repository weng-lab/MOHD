import { hg38, type TrackCollection } from "@weng-lab/genomebrowser";
import { getGeneDatasetTitle, getGeneDatasetsForAssembly } from "@weng-lab/genomebrowser-tracks/gene";

/**
 * Gene annotation catalog.
 *
 * Uses the `gene` track module, which reads GENCODE straight from a
 * BigGenePred file over byte-range requests. (The older `transcript` module
 * went through the SCREEN GraphQL API and is capped at older releases.)
 */

export const GENES_COLLECTION_ID = "human-genes";

/**
 * GENCODE release shown by default. The Gene settings panel exposes dataset and
 * version selectors for host-owned tracks, so users can switch releases without
 * a code change; this only sets the starting point.
 */
const GENCODE_VERSION = 49;
const GENCODE_VARIANT = "basic";

function getGencodeDataset() {
  const dataset = getGeneDatasetsForAssembly(hg38.id).find(
    (candidate) => candidate.version === GENCODE_VERSION && candidate.variant === GENCODE_VARIANT
  );

  if (!dataset) {
    throw new Error(
      `No GENCODE ${GENCODE_VERSION} ${GENCODE_VARIANT} annotation is available for ${hg38.id}. ` +
        `Check the catalog in @weng-lab/genomebrowser-tracks/gene.`
    );
  }

  return dataset;
}

const gencodeDataset = getGencodeDataset();

/** Qualified ID that TrackSelect and the track store use. */
export function qualifyGeneTrackId(trackId: string) {
  return `${GENES_COLLECTION_ID}::${trackId}`;
}

// Deliberately not the dataset ID: keeping it release-independent means a saved
// track selection survives changing GENCODE_VERSION.
export const GENCODE_BASIC_TRACK_ID = qualifyGeneTrackId("gencode-basic");

export const genesCollection: TrackCollection = {
  assembly: hg38.id,
  id: GENES_COLLECTION_ID,
  label: "Genes",
  description: "Gene annotation tracks",
  views: [
    {
      id: "genes",
      label: "Genes",
      columns: [
        { field: "displayName", label: "Name", width: 200 },
        { field: "release", label: "Release", width: 120 },
      ],
      grouping: [],
      leaf: "displayName",
    },
  ],
  tracks: [
    {
      type: "gene",
      base: {
        id: "gencode-basic",
        // Matching the catalog title lets the title follow the dataset when a user
        // switches releases in the settings panel.
        title: getGeneDatasetTitle(gencodeDataset),
        display: "full",
        color: "#0c184a",
      },
      config: {
        url: gencodeDataset.url,
        // The v1 transcript track coloured MANE Select transcripts separately;
        // the gene module expresses that as a tag colour.
        tagColors: [{ tag: "MANE_Select", color: "#100e98" }],
        highlightColor: "#3c69e8",
      },
      metadata: {
        displayName: getGeneDatasetTitle(gencodeDataset),
        release: gencodeDataset.release,
      },
    },
  ],
};
