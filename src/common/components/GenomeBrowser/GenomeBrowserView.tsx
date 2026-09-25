"use client";
import { useEffect, useMemo, useState } from "react";
import { Stack, useMediaQuery } from "@mui/system";
import { ScreenApolloWrapper } from "@/common/apollo/apollo-wrapper";
import { GenomeBrowser, createBrowserStore, createTrackStore } from "@weng-lab/genomebrowser";
import BrowserControls from "./_components/BrowserControls";
import DomainDisplay from "./_components/DomainDisplay";
import { DEFAULT_BROWSER_STATE } from "./defaultBrowserState";
import { RULER_TRACK_ID, TRACK_MODULES, createRulerTrack, createTrackCollections, type MohdOme } from "./tracks";
import { loadTrackIds, saveTrackIds } from "./trackSelectStorage";

const MAX_TRACKS = 30;

export type GenomeBrowserViewProps = {
  /** Tracks selected by default when the browser first loads (and no session-stored selection exists). */
  initialSelectedIds: readonly string[];
  /** sessionStorage key used to persist the user's track selection; keep unique per browser instance. */
  sessionStorageKey: string;
  /** Restricts the MOHD collection (in the browser tracks and the Select Tracks dialog) to a single ome's experiments. */
  mohdOme?: MohdOme;
};

export default function GenomeBrowserView({ initialSelectedIds, sessionStorageKey, mohdOme }: GenomeBrowserViewProps) {
  // Keep the collections stable: rebuilding the array re-parses every collection
  // and can restart TrackSelect's initialization.
  const { collections, mohdTrackInfoById, validTrackIds } = useMemo(() => createTrackCollections(mohdOme), [mohdOme]);

  const [useBrowserStore] = useState(() => createBrowserStore(DEFAULT_BROWSER_STATE));
  // v2 core ships no track types of its own, and the coordinate ruler is now an
  // ordinary (pinned) track rather than browser chrome.
  const [useTrackStore] = useState(() =>
    createTrackStore({
      modules: TRACK_MODULES,
      tracks: [createRulerTrack()],
      pinnedTrackIds: [RULER_TRACK_ID],
    })
  );

  const [restoredTrackIds, setRestoredTrackIds] = useState<readonly string[] | undefined>(undefined);

  // Restore the saved selection after mount. Reading sessionStorage while
  // rendering would disagree with what the server rendered, so — as with the
  // download tray — the restore has to land one paint late.
  // react-doctor-disable-next-line react-doctor/rendering-hydration-no-flicker
  useEffect(() => {
    // Deliberate: a lazy useState initializer would read storage during render.
    // react-doctor-disable-next-line react-hooks-js/set-state-in-effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRestoredTrackIds(loadTrackIds(sessionStorageKey, validTrackIds, MAX_TRACKS));
  }, [sessionStorageKey, validTrackIds]);

  const isMedium = useMediaQuery("(max-width:900px)");
  const isSmall = useMediaQuery("(max-width:600px)");
  const trackWidth = isSmall ? 550 : isMedium ? 950 : 1400;
  const titleSize = isSmall ? 18 : isMedium ? 14 : 12;
  const fontSize = titleSize - 2;

  useEffect(() => {
    const current = useBrowserStore.getState();

    if (current.trackWidth === trackWidth && current.titleSize === titleSize && current.fontSize === fontSize) {
      return;
    }

    useBrowserStore.setState({ trackWidth, titleSize, fontSize });
  }, [trackWidth, titleSize, fontSize, useBrowserStore]);

  return (
    <ScreenApolloWrapper>
      <Stack sx={{ overflow: "hidden", px: { xs: 2, md: 4, lg: 6 }, py: 2 }}>
        <BrowserControls
          browserStore={useBrowserStore}
          trackStore={useTrackStore}
          collections={collections}
          mohdTrackInfoById={mohdTrackInfoById}
          initialTrackIds={restoredTrackIds}
          defaultTrackIds={initialSelectedIds}
          maxTracks={MAX_TRACKS}
          onCommittedTrackIds={(trackIds) => saveTrackIds(sessionStorageKey, trackIds)}
        />
        <DomainDisplay useBrowserStore={useBrowserStore} />
        <GenomeBrowser browserStore={useBrowserStore} trackStore={useTrackStore} />
      </Stack>
    </ScreenApolloWrapper>
  );
}
