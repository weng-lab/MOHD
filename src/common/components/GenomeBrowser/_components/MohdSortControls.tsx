import { Button, ButtonGroup } from "@mui/material";
import type { TrackStoreInstance } from "@weng-lab/genomebrowser";
import { MOHD_COLLECTION_ID, type MohdTrackInfo } from "../tracks";

const MOHD_TRACK_PREFIX = `${MOHD_COLLECTION_ID}::`;
const OME_ORDER = new Map([
  ["ATAC", 0],
  ["RNA", 1],
  ["WGBS", 2],
]);
const ATAC_TRACK_ORDER = new Map([
  ["FDR 0.05 peaks", 0],
  ["Pseudorep peaks", 1],
  ["Fold change signal", 2],
  ["p-value signal", 3],
]);
const RNA_TRACK_ORDER = new Map([
  ["All Signal Plus", 0],
  ["Unique Signal Plus", 1],
  ["All Signal Minus", 2],
  ["Unique Signal Minus", 3],
]);

type MohdSortMode = "kitId" | "fileType";

function getOmeRank(ome: string) {
  return OME_ORDER.get(ome) ?? Number.MAX_SAFE_INTEGER;
}

function getTrackRank(row: MohdTrackInfo) {
  if (row.ome === "ATAC") {
    return ATAC_TRACK_ORDER.get(row.description) ?? Number.MAX_SAFE_INTEGER;
  }

  if (row.ome === "RNA") {
    return RNA_TRACK_ORDER.get(row.description) ?? Number.MAX_SAFE_INTEGER;
  }

  return Number.MAX_SAFE_INTEGER;
}

function compareByKitId(a: MohdTrackInfo, b: MohdTrackInfo) {
  const aKitId = a.kitId?.trim();
  const bKitId = b.kitId?.trim();

  if (aKitId && bKitId) {
    return aKitId.localeCompare(bKitId);
  } else if (aKitId || bKitId) {
    return aKitId ? -1 : 1;
  }

  return 0;
}

function compareBySampleId(a: MohdTrackInfo, b: MohdTrackInfo) {
  return a.sampleId.localeCompare(b.sampleId);
}

function compareKnownRows(a: MohdTrackInfo, b: MohdTrackInfo, mode: MohdSortMode, fallbackIndexDiff: number) {
  const byKitId = compareByKitId(a, b);
  const byOme = getOmeRank(a.ome) - getOmeRank(b.ome);
  const byTrackType = getTrackRank(a) - getTrackRank(b);
  const bySampleId = compareBySampleId(a, b);

  if (mode === "kitId") {
    if (byKitId !== 0) {
      return byKitId;
    }

    if (byOme !== 0) {
      return byOme;
    }

    if (byTrackType !== 0) {
      return byTrackType;
    }

    if (bySampleId !== 0) {
      return bySampleId;
    }

    return fallbackIndexDiff;
  }

  if (byOme !== 0) {
    return byOme;
  }

  if (byTrackType !== 0) {
    return byTrackType;
  }

  if (byKitId !== 0) {
    return byKitId;
  }

  if (bySampleId !== 0) {
    return bySampleId;
  }

  return fallbackIndexDiff;
}

export default function MohdSortControls({
  trackInfoById,
  useTrackStore,
}: {
  trackInfoById: Map<string, MohdTrackInfo>;
  useTrackStore: TrackStoreInstance;
}) {
  // The store hook is passed in as a prop, so the compiler can't prove it's the same
  // function every render. These controls render outside <GenomeBrowser>, so the
  // store context hooks aren't available here.
  // react-doctor-disable-next-line react-hooks-js/hooks
  const tracks = useTrackStore((s) => s.tracks);
  // react-doctor-disable-next-line react-hooks-js/hooks
  const reorderTracks = useTrackStore((s) => s.reorderTracks);

  const sortMohdTracks = (mode: MohdSortMode) => {
    const nonMohdTrackIds: string[] = [];
    const mohdTracks: Array<{ id: string; index: number; row?: MohdTrackInfo }> = [];

    tracks.forEach((track, index) => {
      const id = track.base.id;

      if (!id.startsWith(MOHD_TRACK_PREFIX)) {
        nonMohdTrackIds.push(id);
        return;
      }

      mohdTracks.push({ id, index, row: trackInfoById.get(id) });
    });

    if (mohdTracks.length === 0) {
      return;
    }

    mohdTracks.sort((a, b) => {
      if (!a.row && !b.row) {
        return a.index - b.index;
      }

      if (!a.row) {
        return 1;
      }

      if (!b.row) {
        return -1;
      }

      return compareKnownRows(a.row, b.row, mode, a.index - b.index);
    });

    // reorderTracks requires the complete set of track IDs, not just the moved ones.
    reorderTracks([...nonMohdTrackIds, ...mohdTracks.map((track) => track.id)]);
  };

  return (
    <ButtonGroup variant="outlined" size="small" aria-label="Sort MOHD tracks" sx={{ minHeight: 44 }}>
      <Button onClick={() => sortMohdTracks("kitId")}>Sort by Kit ID</Button>
      <Button onClick={() => sortMohdTracks("fileType")}>Sort by File Type</Button>
    </ButtonGroup>
  );
}
