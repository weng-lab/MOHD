"use client";

import GenomeBrowserView from "@/common/components/GenomeBrowser/GenomeBrowserView";
import {
  WGBS_DEFAULT_SELECTED_TRACK_IDS,
  WGBS_TRACK_SELECT_SESSION_KEY,
} from "@/common/components/GenomeBrowser/defaultSelections";

export default function WGBSGenomeBrowserPage() {
  return (
    <GenomeBrowserView
      initialSelectedIds={WGBS_DEFAULT_SELECTED_TRACK_IDS}
      sessionStorageKey={WGBS_TRACK_SELECT_SESSION_KEY}
      mohdOme="WGBS"
    />
  );
}
