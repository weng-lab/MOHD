"use client";

import GenomeBrowserView from "@/common/components/GenomeBrowser/GenomeBrowserView";
import {
  DEFAULT_SELECTED_TRACK_IDS,
  TRACK_SELECT_SESSION_KEY,
} from "@/common/components/GenomeBrowser/defaultSelections";

export default function GenomeBrowserPage() {
  return (
    <GenomeBrowserView initialSelectedIds={DEFAULT_SELECTED_TRACK_IDS} sessionStorageKey={TRACK_SELECT_SESSION_KEY} />
  );
}
