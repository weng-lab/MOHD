"use client";

import GenomeBrowserView from "@/common/components/GenomeBrowser/GenomeBrowserView";
import {
  RNA_DEFAULT_SELECTED_TRACK_IDS,
  RNA_TRACK_SELECT_SESSION_KEY,
} from "@/common/components/GenomeBrowser/defaultSelections";

export default function RNAGenomeBrowserPage() {
  return (
    <GenomeBrowserView
      initialSelectedIds={RNA_DEFAULT_SELECTED_TRACK_IDS}
      sessionStorageKey={RNA_TRACK_SELECT_SESSION_KEY}
      mohdOme="RNA"
    />
  );
}
