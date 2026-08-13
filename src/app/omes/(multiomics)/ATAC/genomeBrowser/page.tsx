"use client";

import GenomeBrowserView from "@/common/components/GenomeBrowser/GenomeBrowserView";
import {
  ATAC_DEFAULT_SELECTED_TRACK_IDS,
  ATAC_TRACK_SELECT_SESSION_KEY,
} from "@/common/components/GenomeBrowser/defaultSelections";

export default function ATACGenomeBrowserPage() {
  return (
    <GenomeBrowserView
      initialSelectedIds={ATAC_DEFAULT_SELECTED_TRACK_IDS}
      sessionStorageKey={ATAC_TRACK_SELECT_SESSION_KEY}
      mohdOme="ATAC"
    />
  );
}
