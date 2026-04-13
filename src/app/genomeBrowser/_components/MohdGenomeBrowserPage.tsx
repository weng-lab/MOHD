"use client";

import { Search } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, IconButton, Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Browser,
  type Chromosome,
  createBrowserStoreMemo,
  createTrackStoreMemo,
  GQLWrapper,
} from "@weng-lab/genomebrowser";
import { foldersByAssembly, TrackSelect, type InitialSelectedIdsByAssembly } from "@weng-lab/genomebrowser-ui";
import { GenomeSearch, type Result } from "@weng-lab/ui-components";
import { useMemo, useState } from "react";
import ControlButtons from "./ControlButtons";
import DomainDisplay from "./DomainDisplay";
import { DEFAULT_BROWSER_STATE } from "../_config/defaultDomain";
import { DEFAULT_SELECTED_TRACK_IDS, TRACK_SELECT_SESSION_KEY } from "../_config/defaultSelections";

const ASSEMBLY = "GRCh38";
const FOLDER_IDS = new Set(["human-genes", "human-mohd"]);

export default function MohdGenomeBrowserPage() {
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [trackSelectOpen, setTrackSelectOpen] = useState(false);
  const assembly = ASSEMBLY;

  const browserStore = createBrowserStoreMemo(DEFAULT_BROWSER_STATE);
  const trackStore = createTrackStoreMemo([]);

  const folders = useMemo(() => foldersByAssembly[assembly].filter((folder) => FOLDER_IDS.has(folder.id)), [assembly]);

  const initialSelectedIds = useMemo<InitialSelectedIdsByAssembly>(() => DEFAULT_SELECTED_TRACK_IDS, []);

  const setDomain = browserStore((state) => state.setDomain);

  const handleSearchSubmit = (result: Result) => {
    if (!result.domain) {
      return;
    }

    setDomain({
      chromosome: result.domain.chromosome as Chromosome,
      start: result.domain.start,
      end: result.domain.end,
    });
  };

  const geneVersion = [29, 40];
  const maxSearchWidth = isSmall ? undefined : isMedium ? 520 : 600;

  return (
    <GQLWrapper>
      <Stack sx={{ overflow: "hidden", px: { xs: 1, md: 0 }, py: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          sx={{ width: "100%", maxWidth: "100%" }}
        >
          <Box
            sx={{ width: { xs: "100%", md: "auto" }, minWidth: { md: 300 }, maxWidth: maxSearchWidth, flex: 1 }}
          >
            <GenomeSearch
              size="small"
              assembly={assembly}
              geneVersion={geneVersion}
              onSearchSubmit={handleSearchSubmit}
              queries={["Gene", "SNP", "cCRE", "Coordinate"]}
              geneLimit={3}
              sx={{ width: "100%" }}
              slots={{
                button: (
                  <IconButton sx={{ color: theme.palette.primary.main }}>
                    <Search />
                  </IconButton>
                ),
              }}
              slotProps={{
                input: {
                  label: "Change Browser Region",
                  sx: {
                    backgroundColor: "white",
                    "& label.Mui-focused": {
                      color: theme.palette.primary.main,
                    },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  },
                },
              }}
            />
          </Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: { xs: "100%", md: "auto" },
              justifyContent: { xs: "stretch", md: "flex-end" },
              "& > button": {
                flex: { xs: 1, md: "none" },
              },
            }}
          >
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
          <DomainDisplay browserStore={browserStore} />
          <ControlButtons browserStore={browserStore} />
        </Stack>
        <Browser browserStore={browserStore} trackStore={trackStore} />
        <TrackSelect
          assembly={assembly}
          folders={folders}
          initialSelectedIds={initialSelectedIds}
          sessionStorageKey={TRACK_SELECT_SESSION_KEY}
          trackStore={trackStore}
          maxTracks={30}
          open={trackSelectOpen}
          onClose={() => setTrackSelectOpen(false)}
          title="Select Tracks"
        />
      </Stack>
    </GQLWrapper>
  );
}
