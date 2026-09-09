import { bigBedModule } from "@weng-lab/genomebrowser-tracks/bigbed";
import { bigWigModule } from "@weng-lab/genomebrowser-tracks/bigwig";
import { methylCModule } from "@weng-lab/genomebrowser-tracks/methylc";
import { rulerModule } from "@weng-lab/genomebrowser-tracks/ruler";
import { transcriptModule } from "@weng-lab/genomebrowser-tracks/transcript";
import { genesCollection } from "./genes";
import { createMohdCatalog, type MohdOme } from "./mohd";

/**
 * Track modules the browser can render. v2 core ships no track types of its
 * own, so every type used by a collection must be registered here.
 */
export const TRACK_MODULES = [bigWigModule, bigBedModule, methylCModule, transcriptModule, rulerModule];

export const RULER_TRACK_ID = "ruler";

/** v1 drew the coordinate ruler implicitly; v2 makes it an ordinary track. */
export function createRulerTrack() {
  return rulerModule.create({ id: RULER_TRACK_ID, title: "Coordinates", config: {} });
}

/** Collections offered in the Select Tracks dialog, optionally scoped to one ome. */
export function createTrackCollections(mohdOme?: MohdOme) {
  const mohd = createMohdCatalog(mohdOme);
  const collections = [genesCollection, mohd.collection];

  return {
    collections,
    mohdTrackInfoById: mohd.trackInfoById,
    /**
     * Every qualified track ID these collections can resolve. TrackSelect
     * rejects unknown IDs, so a restored selection has to be filtered against
     * this before it is passed back in.
     */
    validTrackIds: new Set(
      collections.flatMap((collection) => collection.tracks.map((track) => `${collection.id}::${track.id}`))
    ),
  };
}

export { GENCODE_BASIC_TRACK_ID, genesCollection } from "./genes";
export { MOHD_COLLECTION_ID, createMohdCatalog, qualifyMohdTrackId } from "./mohd";
export type { MohdOme, MohdTrackInfo } from "./mohd";
