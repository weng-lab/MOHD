"use client";
import { useEffect, useMemo, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import HighlightIcon from "@mui/icons-material/Highlight";
import { Button } from "@mui/material";
import { Stack, useMediaQuery } from "@mui/system";
import { ScreenApolloWrapper } from "@/common/apollo/apollo-wrapper";
import { GenomeBrowser, createBrowserStore, createSettingsStore, createTrackStore } from "@weng-lab/genomebrowser";
import { TrackBaseSettings } from "@weng-lab/genomebrowser-tracks/shared";
import { BrowserSelectionControls, HighlightDialog, TrackSelect } from "@weng-lab/genomebrowser-ui";
import BrowserSearch from "./_components/BrowserSearch";
import ControlButtons from "./_components/ControlButtons";
import DomainDisplay from "./_components/DomainDisplay";
import MohdSortControls from "./_components/MohdSortControls";
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
  const [trackSelectOpen, setTrackSelectOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);

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

  // Core is MUI-independent, so its stock base settings are unstyled HTML inputs.
  // TrackBaseSettings renders the same title/display/colour/height fields as MUI,
  // matching each module's own settings panel below it.
  const [useSettingsStore] = useState(() => createSettingsStore({ baseSettingsComponent: TrackBaseSettings }));

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
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <BrowserSearch useBrowserStore={useBrowserStore} />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{
              width: { xs: "100%", md: "auto" },
            }}
          >
            <MohdSortControls trackInfoById={mohdTrackInfoById} useTrackStore={useTrackStore} />
            <Button
              variant="contained"
              startIcon={<HighlightIcon />}
              size="small"
              onClick={() => setHighlightOpen(true)}
              sx={{ minHeight: 44 }}
            >
              Highlights
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              size="small"
              onClick={() => setTrackSelectOpen(true)}
              sx={{ minHeight: 44 }}
            >
              Select Tracks
            </Button>
          </Stack>
        </Stack>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          border="1px solid rgb(204, 204, 204)"
          borderBottom="none"
          p={1}
          mt={2}
        >
          <DomainDisplay useBrowserStore={useBrowserStore} />
          <Stack direction="column" spacing={1} alignItems="center">
            <BrowserSelectionControls browserStore={useBrowserStore} />
            <ControlButtons useBrowserStore={useBrowserStore} />
          </Stack>
        </Stack>
        <GenomeBrowser browserStore={useBrowserStore} trackStore={useTrackStore} settingsStore={useSettingsStore} />
      </Stack>
      <HighlightDialog browserStore={useBrowserStore} open={highlightOpen} onClose={() => setHighlightOpen(false)} />
      <TrackSelect
        trackCollections={collections}
        useTrackStore={useTrackStore}
        initialTrackIds={restoredTrackIds}
        defaultTrackIds={initialSelectedIds}
        onCommittedTrackIds={(trackIds) => saveTrackIds(sessionStorageKey, trackIds)}
        maxTracks={MAX_TRACKS}
        open={trackSelectOpen}
        onClose={() => setTrackSelectOpen(false)}
        title="Select Tracks"
      />
    </ScreenApolloWrapper>
  );
}
