import { bigBedModule } from "@weng-lab/genomebrowser-tracks/bigbed";
import { bigWigModule } from "@weng-lab/genomebrowser-tracks/bigwig";
import { geneModule } from "@weng-lab/genomebrowser-tracks/gene";
import { methylCModule } from "@weng-lab/genomebrowser-tracks/methylc";
import { rulerModule } from "@weng-lab/genomebrowser-tracks/ruler";
import { genesCollection } from "./genes";
import { createMohdCatalog, type MohdOme } from "./mohd";

/**
 * Track modules the browser can render. v2 core ships no track types of its
 * own, so every type used by a collection must be registered here.
 */
export const TRACK_MODULES = [bigWigModule, bigBedModule, methylCModule, geneModule, rulerModule];

export const RULER_TRACK_ID = "ruler";

/** UCSC hg38 reference genome, served with byte-range and CORS support. */
const HG38_2BIT_URL = "https://hgdownload.soe.ucsc.edu/goldenpath/hg38/bigZips/hg38.2bit";

/**
 * v1 drew the coordinate ruler implicitly; v2 makes it an ordinary track.
 *
 * With a 2bit source the ruler also draws reference bases once the view is
 * zoomed in far enough — by default 15 SVG pixels per base, so roughly 90bp at
 * our widest track width. Broader views make no sequence request at all.
 */
export function createRulerTrack() {
  return rulerModule.create({
    id: RULER_TRACK_ID,
    title: "Coordinates",
    config: { sequenceUrl: HG38_2BIT_URL },
  });
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
