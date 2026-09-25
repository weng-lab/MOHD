"use client";
import { useState } from "react";
import { Box } from "@mui/material";
import { createTheme, ThemeProvider, type Theme } from "@mui/material/styles";
import type { BrowserStoreInstance, TrackCollection, TrackStoreInstance } from "@weng-lab/genomebrowser";
import { ControlToolbar, HighlightDialog, TrackSelect } from "@weng-lab/genomebrowser-ui";
import type { MohdTrackInfo } from "../tracks";
import MohdSortControls from "./MohdSortControls";

const ASSEMBLY = "GRCh38";

// Menu scroll locking changes the responsive browser's width and redraws its tracks.
const toolbarTheme = (theme: Theme) =>
  createTheme(theme, {
    components: {
      MuiSelect: { defaultProps: { MenuProps: { disableScrollLock: true } } },
    },
  });

export default function BrowserControls({
  browserStore,
  trackStore,
  collections,
  mohdTrackInfoById,
  initialTrackIds,
  defaultTrackIds,
  maxTracks,
  onCommittedTrackIds,
}: {
  browserStore: BrowserStoreInstance;
  trackStore: TrackStoreInstance;
  collections: TrackCollection[];
  mohdTrackInfoById: Map<string, MohdTrackInfo>;
  initialTrackIds: readonly string[] | undefined;
  defaultTrackIds: readonly string[];
  maxTracks: number;
  onCommittedTrackIds: (trackIds: readonly string[]) => void;
}) {
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [trackSelectOpen, setTrackSelectOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: 1440,
          mx: "auto",
          "& > [role='group']": { justifyContent: "space-evenly" },
        }}
      >
        <ThemeProvider theme={toolbarTheme}>
          <ControlToolbar
            browserStore={browserStore}
            search={{
              assembly: ASSEMBLY,
              graphqlUrl: "/api/screen-graphql",
              queries: ["Gene", "SNP", "cCRE", "Coordinate"],
            }}
            managementActions={<MohdSortControls trackInfoById={mohdTrackInfoById} useTrackStore={trackStore} />}
            onManageHighlights={() => setHighlightOpen(true)}
            onSelectTracks={() => setTrackSelectOpen(true)}
          />
        </ThemeProvider>
      </Box>
      <HighlightDialog browserStore={browserStore} open={highlightOpen} onClose={() => setHighlightOpen(false)} />
      <TrackSelect
        trackCollections={collections}
        useTrackStore={trackStore}
        initialTrackIds={initialTrackIds}
        defaultTrackIds={defaultTrackIds}
        onCommittedTrackIds={onCommittedTrackIds}
        maxTracks={maxTracks}
        open={trackSelectOpen}
        onClose={() => setTrackSelectOpen(false)}
        title="Select Tracks"
      />
    </>
  );
}
