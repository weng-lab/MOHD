"use client";
// "use no memo";
// required to avoid RC from skipping over zustand hooks
// otherwise it will cause hook count related errors

// React
import { useEffect, useState } from "react";

// MUI
import EditIcon from "@mui/icons-material/Edit";
import HighlightIcon from "@mui/icons-material/Highlight";
import { Button } from "@mui/material";
import { Stack, useMediaQuery } from "@mui/system";

// weng lab
import {
  Browser,
  GQLWrapper
} from "@weng-lab/genomebrowser";
import {
  foldersByAssembly,
  InitialSelectedIdsByAssembly,
  TrackSelect,
} from "@weng-lab/genomebrowser-ui";

// Internal
import BrowserSearch from "./_components/BrowserSearch";
import ControlButtons from "./_components/ControlButtons";
import DomainDisplay from "./_components/DomainDisplay";
import HighlightDialog from "./_components/HighlightDialog";
import {
  DEFAULT_SELECTED_TRACK_IDS,
  TRACK_SELECT_SESSION_KEY,
} from "./defaultSelections";
import { useBrowserStore, useTrackStore } from "./stores";

const ASSEMBLY = "GRCh38";
const FOLDER_IDS = new Set(["human-genes", "human-mohd"]);
const FOLDERS = foldersByAssembly[ASSEMBLY].filter((folder) =>
  FOLDER_IDS.has(folder.id),
);
const INITIAL_SELECTED_IDS: InitialSelectedIdsByAssembly =
  DEFAULT_SELECTED_TRACK_IDS;

export default function MohdGenomeBrowserPage() {
  const [trackSelectOpen, setTrackSelectOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);

  const isMedium = useMediaQuery("(max-width:900px)");
  const isSmall = useMediaQuery("(max-width:600px)");
  const trackWidth = isSmall ? 550 : isMedium ? 950 : 1400;
  const titleSize = isSmall ? 18 : isMedium ? 14 : 12;

  const setTrackWidth = useBrowserStore((s) => s.setTrackWidth);
  const setTitleSize = useBrowserStore((s) => s.setTitleSize);
  const setFontSize = useBrowserStore((s) => s.setFontSize);

  useEffect(() => {
    setTrackWidth(trackWidth);
    setTitleSize(titleSize);
    setFontSize(titleSize - 2);
  }, [trackWidth, titleSize, setTrackWidth, setTitleSize, setFontSize]);

  return (
    <GQLWrapper>
      <Stack sx={{ overflow: "hidden", px: { xs: 2, md: 4, lg: 6 }, py: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <BrowserSearch />
          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: { xs: "100%", md: "auto" },
            }}
          >
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
          <DomainDisplay />
          <ControlButtons />
        </Stack>
        <Browser browserStore={useBrowserStore} trackStore={useTrackStore} />
      </Stack>
      <HighlightDialog open={highlightOpen} onClose={() => setHighlightOpen(false) } />
        <TrackSelect
          assembly={ASSEMBLY}
          folders={FOLDERS}
          initialSelectedIds={INITIAL_SELECTED_IDS}
          sessionStorageKey={TRACK_SELECT_SESSION_KEY}
          trackStore={useTrackStore}
          maxTracks={30}
          open={trackSelectOpen}
          onClose={() => setTrackSelectOpen(false)}
          title="Select Tracks"
        />
    </GQLWrapper>
  );
}
