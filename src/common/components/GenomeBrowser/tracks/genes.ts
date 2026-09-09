import { defaultScreenGraphQlEndpoint } from "@weng-lab/genomebrowser";
import type { TrackSelectCollection } from "@weng-lab/genomebrowser-ui";

/**
 * Gene annotation catalog.
 *
 * Ported from the `human-genes` folder that `@weng-lab/genomebrowser-ui` v1
 * shipped. The transcript track reads from the SCREEN GraphQL API through this
 * app's `/api/screen-graphql` proxy, which attaches the API key.
 */

export const GENES_COLLECTION_ID = "human-genes";

const GENCODE_VERSIONS = [29, 40];

/** Qualified ID that TrackSelect and the track store use. */
export function qualifyGeneTrackId(trackId: string) {
  return `${GENES_COLLECTION_ID}::${trackId}`;
}

export const GENCODE_BASIC_TRACK_ID = qualifyGeneTrackId("gencode-basic");

export const genesCollection: TrackSelectCollection = {
  id: GENES_COLLECTION_ID,
  label: "Genes",
  description: "Gene annotation tracks",
  views: [
    {
      id: "genes",
      label: "Genes",
      columns: [
        { field: "displayName", label: "Name", width: 200 },
        { field: "versions", label: "Versions", width: 150 },
      ],
      grouping: [],
      leaf: "displayName",
    },
  ],
  tracks: [
    {
      type: "transcript",
      id: "gencode-basic",
      title: "GENCODE Genes",
      display: "squish",
      height: 100,
      color: "#0c184a",
      config: {
        endpoint: defaultScreenGraphQlEndpoint,
        assembly: "GRCh38",
        version: GENCODE_VERSIONS[GENCODE_VERSIONS.length - 1],
        canonicalColor: "#100e98",
        highlightColor: "#3c69e8",
      },
      metadata: {
        displayName: "GENCODE Basic Genes",
        versions: GENCODE_VERSIONS.map((version) => `v${version}`).join(", "),
      },
    },
  ],
};
