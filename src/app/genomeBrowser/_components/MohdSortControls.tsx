import { Button, ButtonGroup } from "@mui/material";
import {
  type MohdRowInfo,
} from "@weng-lab/genomebrowser-ui";
import { useMemo } from "react";
import { useTrackStore } from "../stores";

const MOHD_FOLDER_ID = "human-mohd";
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

function getTrackRank(row: MohdRowInfo) {
  if (row.ome === "ATAC") {
    return ATAC_TRACK_ORDER.get(row.description) ?? Number.MAX_SAFE_INTEGER;
  }

  if (row.ome === "RNA") {
    return RNA_TRACK_ORDER.get(row.description) ?? Number.MAX_SAFE_INTEGER;
  }

  return Number.MAX_SAFE_INTEGER;
}

function compareByKitId(a: MohdRowInfo, b: MohdRowInfo) {
  const aKitId = a.kitId?.trim();
  const bKitId = b.kitId?.trim();

  if (aKitId && bKitId) {
    return aKitId.localeCompare(bKitId);
  } else if (aKitId || bKitId) {
    return aKitId ? -1 : 1;
  }

  return 0;
}

function compareBySampleId(a: MohdRowInfo, b: MohdRowInfo) {
  return a.sampleId.localeCompare(b.sampleId);
}

function compareKnownRows(
  a: MohdRowInfo,
  b: MohdRowInfo,
  mode: MohdSortMode,
  fallbackIndexDiff: number,
) {
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
  folders,
}: {
  folders: Array<{ id: string; rows?: MohdRowInfo[] }>;
}) {
  const tracks = useTrackStore((s) => s.tracks);
  const reorderTracks = useTrackStore((s) => s.reorderTracks);

  const mohdRowById = useMemo(() => {
    const mohdFolder = folders.find((folder) => folder.id === MOHD_FOLDER_ID);
    const rows = (mohdFolder?.rows ?? []) as MohdRowInfo[];

    return new Map(rows.map((row) => [row.id, row]));
  }, [folders]);

  const sortMohdTracks = (mode: MohdSortMode) => {
    if (!reorderTracks) {
      return;
    }

    const nonMohdTracks: typeof tracks = [];
    const mohdTracks: Array<{
      id: string;
      index: number;
      row?: MohdRowInfo;
    }> = [];

    tracks.forEach((track, index) => {
      if (!track.id.startsWith(`${MOHD_FOLDER_ID}/`)) {
        nonMohdTracks.push(track);
        return;
      }

      mohdTracks.push({
        id: track.id,
        index,
        row: mohdRowById.get(track.id),
      });
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

    reorderTracks([
      ...nonMohdTracks.map((track) => track.id),
      ...mohdTracks.map((track) => track.id),
    ]);
  };

  return (
    <ButtonGroup
      variant="outlined"
      size="small"
      aria-label="Sort MOHD tracks"
      sx={{ minHeight: 44 }}
    >
      <Button onClick={() => sortMohdTracks("kitId")}>
        Sort by Kit ID
      </Button>
      <Button onClick={() => sortMohdTracks("fileType")}>
        Sort by File Type
      </Button>
    </ButtonGroup>
  );
}
