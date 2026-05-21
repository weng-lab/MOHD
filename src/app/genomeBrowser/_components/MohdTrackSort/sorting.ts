import type { MohdRowInfo } from "@weng-lab/genomebrowser-ui";
import {
  ATAC_TRACK_ORDER,
  MOHD_FOLDER_ID,
  OME_ORDER,
  RNA_TRACK_ORDER,
} from "./constants";
import type { MohdSortCriterion, MohdSortFacetKey } from "./types";

type TrackLike = {
  id: string;
};

type MohdSortableTrack<TTrack extends TrackLike> = {
  track: TTrack;
  index: number;
  row?: MohdRowInfo;
};

function compareStrings(aValue?: string, bValue?: string) {
  const a = aValue?.trim();
  const b = bValue?.trim();

  if (a && b) {
    return a.localeCompare(b);
  }

  if (a || b) {
    return a ? -1 : 1;
  }

  return 0;
}

function getOmeRank(ome: string) {
  return OME_ORDER.get(ome) ?? Number.MAX_SAFE_INTEGER;
}

function getDescriptionRank(row: MohdRowInfo) {
  if (row.ome === "ATAC") {
    return ATAC_TRACK_ORDER.get(row.description) ?? Number.MAX_SAFE_INTEGER;
  }

  if (row.ome === "RNA") {
    return RNA_TRACK_ORDER.get(row.description) ?? Number.MAX_SAFE_INTEGER;
  }

  return Number.MAX_SAFE_INTEGER;
}

function compareByRank(aRank: number, bRank: number) {
  if (aRank !== bRank) {
    return aRank - bRank;
  }

  return 0;
}

function compareFacet(
  a: MohdRowInfo,
  b: MohdRowInfo,
  key: MohdSortFacetKey,
) {
  if (key === "ome") {
    const byRank = compareByRank(getOmeRank(a.ome), getOmeRank(b.ome));
    return byRank || compareStrings(a.ome, b.ome);
  }

  if (key === "description") {
    const byRank = compareByRank(getDescriptionRank(a), getDescriptionRank(b));
    return byRank || compareStrings(a.description, b.description);
  }

  return compareStrings(a[key], b[key]);
}

function compareKnownRows(
  a: MohdRowInfo,
  b: MohdRowInfo,
  criteria: MohdSortCriterion[],
  fallbackIndexDiff: number,
) {
  for (const criterion of criteria) {
    const comparison = compareFacet(a, b, criterion.key);

    if (comparison !== 0) {
      return criterion.direction === "asc" ? comparison : -comparison;
    }
  }

  return fallbackIndexDiff;
}

export function sortMohdTracks<TTrack extends TrackLike>({
  tracks,
  criteria,
  rowById,
}: {
  tracks: TTrack[];
  criteria: MohdSortCriterion[];
  rowById: Map<string, MohdRowInfo>;
}) {
  const nonMohdTracks: TTrack[] = [];
  const mohdTracks: Array<MohdSortableTrack<TTrack>> = [];

  tracks.forEach((track, index) => {
    if (!track.id.startsWith(`${MOHD_FOLDER_ID}/`)) {
      nonMohdTracks.push(track);
      return;
    }

    mohdTracks.push({
      track,
      index,
      row: rowById.get(track.id),
    });
  });

  if (mohdTracks.length === 0) {
    return null;
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

    return compareKnownRows(a.row, b.row, criteria, a.index - b.index);
  });

  return [
    ...nonMohdTracks.map((track) => track.id),
    ...mohdTracks.map(({ track }) => track.id),
  ];
}
