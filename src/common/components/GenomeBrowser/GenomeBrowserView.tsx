"use client";
import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import HighlightIcon from "@mui/icons-material/Highlight";
import { Button } from "@mui/material";
import { Stack, useMediaQuery } from "@mui/system";
import { ScreenApolloWrapper } from "@/common/apollo/apollo-wrapper";
import { Browser, createBrowserStore, createTrackStore } from "@weng-lab/genomebrowser";
import {
  foldersByAssembly,
  InitialSelectedIdsByAssembly,
  type MohdRowInfo,
  TrackSelect,
} from "@weng-lab/genomebrowser-ui";
import BrowserSearch from "./_components/BrowserSearch";
import ControlButtons from "./_components/ControlButtons";
import DomainDisplay from "./_components/DomainDisplay";
import HighlightDialog from "./_components/HighlightDialog";
import MohdSortControls from "./_components/MohdSortControls";
import { DEFAULT_BROWSER_STATE } from "./defaultDomain";

const ASSEMBLY = "GRCh38";
const FOLDER_IDS = new Set(["human-genes", "human-mohd"]);
const MOHD_FOLDER_ID = "human-mohd";
const ALL_FOLDERS = foldersByAssembly[ASSEMBLY].filter((folder) => FOLDER_IDS.has(folder.id));

export type GenomeBrowserViewProps = {
  /** Tracks selected by default when the browser first loads (and no session-stored selection exists). */
  initialSelectedIds: InitialSelectedIdsByAssembly;
  /** sessionStorage key used to persist the user's track selection; keep unique per browser instance. */
  sessionStorageKey: string;
  /** Restricts the MOHD folder (in the browser tracks and the Select Tracks dialog) to a single ome's experiments. */
  mohdOme?: MohdRowInfo["ome"];
};

export default function GenomeBrowserView({ initialSelectedIds, sessionStorageKey, mohdOme }: GenomeBrowserViewProps) {
  const [trackSelectOpen, setTrackSelectOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);

  const FOLDERS = !mohdOme
    ? ALL_FOLDERS
    : ALL_FOLDERS.map((folder) =>
        folder.id !== MOHD_FOLDER_ID
          ? folder
          : {
              ...folder,
              rows: (folder.rows as MohdRowInfo[]).filter((row) => row.ome === mohdOme),
            }
      );

  const [useBrowserStore] = useState(() => createBrowserStore(DEFAULT_BROWSER_STATE));
  const [useTrackStore] = useState(() => createTrackStore([]));

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

    useBrowserStore.setState({
      trackWidth,
      titleSize,
      fontSize,
      browserWidth: trackWidth + current.marginWidth,
    });
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
            <MohdSortControls folders={FOLDERS} useTrackStore={useTrackStore} />
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
          <ControlButtons useBrowserStore={useBrowserStore} />
        </Stack>
        <Browser browserStore={useBrowserStore} trackStore={useTrackStore} />
      </Stack>
      <HighlightDialog open={highlightOpen} onClose={() => setHighlightOpen(false)} useBrowserStore={useBrowserStore} />
      <TrackSelect
        assembly={ASSEMBLY}
        folders={FOLDERS}
        initialSelectedIds={initialSelectedIds}
        sessionStorageKey={sessionStorageKey}
        trackStore={useTrackStore}
        maxTracks={30}
        open={trackSelectOpen}
        onClose={() => setTrackSelectOpen(false)}
        title="Select Tracks"
      />
    </ScreenApolloWrapper>
  );
}
