"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, useMediaQuery } from "@mui/system";
import { ScreenApolloWrapper } from "@/common/apollo/apollo-wrapper";
import { GenomeBrowser, createBrowserStore, createTrackStore } from "@weng-lab/genomebrowser";
import BrowserControls from "./_components/BrowserControls";
import DomainDisplay from "./_components/DomainDisplay";
import { DEFAULT_BROWSER_STATE } from "./defaultBrowserState";
import { REGION_PARAM, formatRegion, parseRegionParam } from "./regionParam";
import {
  MohdTooltipContext,
  RULER_TRACK_ID,
  TRACK_MODULES,
  createRulerTrack,
  createTrackCollections,
  type MohdOme,
} from "./tracks";
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

/** Opens on the region in ?region= when there is one (see regionParam.ts). */
export default function GenomeBrowserView(props: GenomeBrowserViewProps) {
  // The address isn't known when the page is prerendered, so the static HTML holds the browser at
  // its default region. Client navigations have the address already and never show the fallback.
  return (
    <Suspense fallback={<Browser {...props} regionParam={null} />}>
      <LinkedBrowser {...props} />
    </Suspense>
  );
}

function LinkedBrowser(props: GenomeBrowserViewProps) {
  return <Browser {...props} regionParam={useSearchParams().get(REGION_PARAM)} />;
}

function Browser({
  initialSelectedIds,
  sessionStorageKey,
  mohdOme,
  regionParam,
}: GenomeBrowserViewProps & { regionParam: string | null }) {
  // Keep the collections stable: rebuilding the array re-parses every collection
  // and can restart TrackSelect's initialization.
  const { collections, mohdTrackInfoById, validTrackIds } = useMemo(() => createTrackCollections(mohdOme), [mohdOme]);

  const [useBrowserStore] = useState(() =>
    createBrowserStore({
      ...DEFAULT_BROWSER_STATE,
      region: parseRegionParam(regionParam) ?? DEFAULT_BROWSER_STATE.region,
    })
  );

  // A link followed while the browser is open, such as a gene from the header search, moves the view
  // rather than remounting the browser. Keyed on the string, so a re-render can't snap a pan back.
  useEffect(() => {
    const linked = parseRegionParam(regionParam);
    const { region, setRegion } = useBrowserStore.getState();
    if (linked && formatRegion(linked) !== formatRegion(region)) setRegion(linked);
  }, [regionParam, useBrowserStore]);

  // The address follows the view, so a reload or a copied link opens where the user is, and a link
  // back to a region they've panned away from changes the parameter, which the effect above needs.
  // Regions commit once per pan or zoom, not per frame, which keeps this under replaceState's limits.
  useEffect(
    () =>
      useBrowserStore.subscribe(({ region }, previous) => {
        if (region === previous.region) return;
        // Rather than router.replace: Next keeps useSearchParams in step, with no server round trip.
        window.history.replaceState(null, "", `?${REGION_PARAM}=${formatRegion(region)}`);
      }),
    [useBrowserStore]
  );

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
          mohdOme={mohdOme}
          initialTrackIds={restoredTrackIds}
          defaultTrackIds={initialSelectedIds}
          maxTracks={MAX_TRACKS}
          onCommittedTrackIds={(trackIds) => saveTrackIds(sessionStorageKey, trackIds)}
        />
        <DomainDisplay useBrowserStore={useBrowserStore} />
        <MohdTooltipContext value={mohdTrackInfoById}>
          <GenomeBrowser browserStore={useBrowserStore} trackStore={useTrackStore} />
        </MohdTooltipContext>
      </Stack>
    </ScreenApolloWrapper>
  );
}
