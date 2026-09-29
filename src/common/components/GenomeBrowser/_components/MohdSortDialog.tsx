import type { TrackStoreInstance } from "@weng-lab/genomebrowser";
import { TrackSortDialog, type TrackSortOption } from "@weng-lab/genomebrowser-ui";
import { OmesList } from "@/common/types/globalTypes";
import type { MohdTrackInfo } from "../tracks";

function compareByOme(a: MohdTrackInfo, b: MohdTrackInfo) {
  return OmesList.indexOf(a.ome) - OmesList.indexOf(b.ome);
}

const SINGLE_OME_SORT_OPTIONS: TrackSortOption<MohdTrackInfo>[] = [
  { id: "sampleId", label: "Sample ID", compare: (a, b) => a.sampleId.localeCompare(b.sampleId) },
  {
    id: "fileType",
    label: "File Type",
    // File types are ome-specific, so ordering by them means ordering by ome first
    // and then by the file's position within that ome's display order.
    compare: (a, b) => compareByOme(a, b) || a.fileRank - b.fileRank,
  },
];

const MULTI_OME_SORT_OPTIONS: TrackSortOption<MohdTrackInfo>[] = [
  ...SINGLE_OME_SORT_OPTIONS,
  { id: "ome", label: "Ome", compare: compareByOme },
];

export default function MohdSortDialog({
  trackInfoById,
  trackStore,
  open,
  onClose,
  includeOmeSort,
}: {
  trackInfoById: Map<string, MohdTrackInfo>;
  trackStore: TrackStoreInstance;
  open: boolean;
  onClose: () => void;
  /** Sorting by ome is meaningless when the browser only shows one ome's tracks. */
  includeOmeSort: boolean;
}) {
  return (
    <TrackSortDialog
      trackStore={trackStore}
      open={open}
      onClose={onClose}
      options={includeOmeSort ? MULTI_OME_SORT_OPTIONS : SINGLE_OME_SORT_OPTIONS}
      // Only MOHD tracks have info, so every other track keeps its position.
      getMetadata={(track) => trackInfoById.get(track.base.id)}
    />
  );
}
