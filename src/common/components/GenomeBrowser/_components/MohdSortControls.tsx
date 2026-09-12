import { Button, ButtonGroup } from "@mui/material";
import type { TrackStoreInstance } from "@weng-lab/genomebrowser";
import { MOHD_COLLECTION_ID, type MohdTrackInfo } from "../tracks";

const MOHD_TRACK_PREFIX = `${MOHD_COLLECTION_ID}::`;
const OME_ORDER = new Map([
  ["ATAC", 0],
  ["RNA", 1],
  ["WGBS", 2],
]);

type MohdSortMode = "sampleId" | "fileType";

function getOmeRank(ome: string) {
  return OME_ORDER.get(ome) ?? Number.MAX_SAFE_INTEGER;
}

/**
 * File types are ome-specific, so ordering by them means ordering by ome first
 * and then by the file's position within that ome's display order.
 */
function compareByFileType(a: MohdTrackInfo, b: MohdTrackInfo) {
  return getOmeRank(a.ome) - getOmeRank(b.ome) || a.fileRank - b.fileRank;
}

function compareBySampleId(a: MohdTrackInfo, b: MohdTrackInfo) {
  return a.sampleId.localeCompare(b.sampleId);
}

function compareKnownRows(a: MohdTrackInfo, b: MohdTrackInfo, mode: MohdSortMode, fallbackIndexDiff: number) {
  // The two modes use the same keys with swapped precedence: grouping every
  // sample's files together, or gathering the same file type across samples.
  const ordered =
    mode === "sampleId"
      ? [compareBySampleId(a, b), compareByFileType(a, b)]
      : [compareByFileType(a, b), compareBySampleId(a, b)];

  return ordered.find((comparison) => comparison !== 0) ?? fallbackIndexDiff;
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
      <Button onClick={() => sortMohdTracks("sampleId")}>Sort by Sample ID</Button>
      <Button onClick={() => sortMohdTracks("fileType")}>Sort by File Type</Button>
    </ButtonGroup>
  );
}
