import type { TrackStoreInstance } from "@weng-lab/genomebrowser";
import { TrackSortDialog, type TrackSortOption } from "@weng-lab/genomebrowser-ui";
import type { MohdTrackInfo } from "../tracks";

const OME_ORDER = new Map([
  ["ATAC", 0],
  ["RNA", 1],
  ["WGBS", 2],
]);

function getOmeRank(ome: string) {
  return OME_ORDER.get(ome) ?? Number.MAX_SAFE_INTEGER;
}

const SORT_OPTIONS: TrackSortOption<MohdTrackInfo>[] = [
  { id: "sampleId", label: "Sample ID", compare: (a, b) => a.sampleId.localeCompare(b.sampleId) },
  {
    id: "fileType",
    label: "File Type",
    // File types are ome-specific, so ordering by them means ordering by ome first
    // and then by the file's position within that ome's display order.
    compare: (a, b) => getOmeRank(a.ome) - getOmeRank(b.ome) || a.fileRank - b.fileRank,
  },
];

export default function MohdSortDialog({
  trackInfoById,
  trackStore,
  open,
  onClose,
}: {
  trackInfoById: Map<string, MohdTrackInfo>;
  trackStore: TrackStoreInstance;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <TrackSortDialog
      trackStore={trackStore}
      open={open}
      onClose={onClose}
      options={SORT_OPTIONS}
      // Only MOHD tracks have info, so every other track keeps its position.
      getMetadata={(track) => trackInfoById.get(track.base.id)}
    />
  );
}
