import { useMemo, useState } from "react";
import type { TrackStoreInstance } from "@weng-lab/genomebrowser";
import { TrackSortDialog, type TrackSortOption } from "@weng-lab/genomebrowser-ui";
import { AGE_BIN_LABELS } from "@/common/ageBins";
import { OmesList } from "@/common/types/globalTypes";
import type { MohdOme, MohdTrackInfo } from "../tracks";

type MohdSortOption = TrackSortOption<MohdTrackInfo>;

/** Cases first, then risk tiers from most to least, then controls; unlisted values follow. */
const STATUS_ORDER = ["case", "high risk", "low risk", "control"];

function rankIn(order: readonly string[], value: string) {
  const index = order.indexOf(value);
  return index === -1 ? order.length : index;
}

function compareByOme(a: MohdTrackInfo, b: MohdTrackInfo) {
  return OmesList.indexOf(a.ome) - OmesList.indexOf(b.ome);
}

const SAMPLE_ID_OPTION: MohdSortOption = {
  id: "sampleId",
  label: "Sample ID",
  compare: (a, b) => a.sampleId.localeCompare(b.sampleId),
};

const FILE_TYPE_OPTION: MohdSortOption = {
  id: "fileType",
  label: "File Type",
  // File types are ome-specific, so ordering by them means ordering by ome first
  // and then by the file's position within that ome's display order.
  compare: (a, b) => compareByOme(a, b) || a.fileRank - b.fileRank,
};

const OME_OPTION: MohdSortOption = { id: "ome", label: "Ome", compare: compareByOme };

const STATUS_OPTION: MohdSortOption = {
  id: "status",
  label: "Status",
  compare: (a, b) => rankIn(STATUS_ORDER, a.status) - rankIn(STATUS_ORDER, b.status),
};

const SITE_OPTION: MohdSortOption = { id: "site", label: "Site", compare: (a, b) => a.site.localeCompare(b.site) };

// Alphabetical order already puts "prefer no answer" after female and male.
const SEX_OPTION: MohdSortOption = { id: "sex", label: "Sex", compare: (a, b) => a.sex.localeCompare(b.sex) };

const AGE_OPTION: MohdSortOption = {
  id: "age",
  label: "Age",
  // Youngest first, by band; samples with no recorded age sort last.
  compare: (a, b) => rankIn(AGE_BIN_LABELS, a.ageBin ?? "") - rankIn(AGE_BIN_LABELS, b.ageBin ?? ""),
};

const PROTOCOL_OPTION: MohdSortOption = {
  id: "protocol",
  label: "Protocol",
  // Only ATAC samples record a protocol; tracks without one sort last.
  compare: (a, b) => Number(!a.protocol) - Number(!b.protocol) || (a.protocol ?? "").localeCompare(b.protocol ?? ""),
};

/**
 * `defaults` are included in the sort until the user changes it; `all` adds the
 * options that start excluded. Options that can't separate a single ome's
 * tracks are left off that ome's browser.
 */
function getSortOptions(mohdOme: MohdOme | undefined) {
  const defaults = [SAMPLE_ID_OPTION, FILE_TYPE_OPTION, ...(mohdOme ? [] : [OME_OPTION])];
  const extras = [
    STATUS_OPTION,
    SITE_OPTION,
    SEX_OPTION,
    AGE_OPTION,
    ...(!mohdOme || mohdOme === "ATAC" ? [PROTOCOL_OPTION] : []),
  ];

  return { defaults, all: [...defaults, ...extras] };
}

export default function MohdSortDialog({
  trackInfoById,
  trackStore,
  open,
  onClose,
  mohdOme,
}: {
  trackInfoById: Map<string, MohdTrackInfo>;
  trackStore: TrackStoreInstance;
  open: boolean;
  onClose: () => void;
  mohdOme: MohdOme | undefined;
}) {
  const sortOptions = useMemo(() => getSortOptions(mohdOme), [mohdOme]);

  // TrackSortDialog includes every option it mounts with and starts options added
  // afterwards as excluded, so the extras are held back until it first opens.
  const [hasOpened, setHasOpened] = useState(false);
  if (open && !hasOpened) {
    setHasOpened(true);
  }

  return (
    <TrackSortDialog
      trackStore={trackStore}
      open={open}
      onClose={onClose}
      options={hasOpened ? sortOptions.all : sortOptions.defaults}
      // Only MOHD tracks have info, so every other track keeps its position.
      getMetadata={(track) => trackInfoById.get(track.base.id)}
    />
  );
}
