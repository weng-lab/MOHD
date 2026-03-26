"use client";
import { theme } from "@/app/theme";
import { Search } from "@mui/icons-material";
import { IconButton, useTheme } from "@mui/material";
import { Box, Stack, useMediaQuery } from "@mui/system";
import {
  Browser,
  createBrowserStoreMemo,
  createDataStoreMemo,
  createTrackStoreMemo,
  GQLWrapper,
} from "@weng-lab/genomebrowser";
import { GenomeSearch } from "@weng-lab/ui-components";
import { useCallback, useState, type ComponentProps } from "react";
import ControlButtons from "./Controls/ControlButtons";
import DomainDisplay from "./Controls/DomainDisplay";
import { transcriptTrack } from "./Tracks/default";
import HighlightDialog from "./UI/HighlightDialog";

const ASSEMBLY = "GRCh38";
const SEARCH_QUERIES: ComponentProps<typeof GenomeSearch>["queries"] = [
  "Gene",
  "SNP",
  "cCRE",
  "Coordinate",
];

const toolbarSx = { width: "100%", maxWidth: "100%", pt: 1 };

const searchGroupSx = {
  width: { xs: "100%", md: "auto" },
  flex: { md: 1 },
  maxWidth: { md: 600 },
};

const searchWrapperSx = {
  width: { xs: "100%", md: "auto" },
  minWidth: { md: 300 },
  maxWidth: { md: 450 },
  flex: { md: 1 },
};

const searchInputSx = {
  backgroundColor: "white",
  "& label.Mui-focused": {
    color: theme.palette.primary.main,
  },
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
};

const actionsSx = {
  width: { xs: "100%", md: "auto" },
  justifyContent: { xs: "stretch", md: "flex-end" },
  "& > button": {
    flex: { xs: 1, md: "none" },
  },
};

const controlsSx = {
  border: "1px solid rgb(204, 204, 204)",
  borderBottom: "none",
  p: 1,
  mt: 2,
};

export default function GenomeBrowser() {
  const [geneVersion] = useState(49);
  const handleSearchSubmit = useCallback(() => {}, []);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));
  const trackWidth = isSmall ? 550 : isMedium ? 950 : 1450;

  const browserStore = createBrowserStoreMemo({
    domain: { chromosome: "chr12", start: 53372922, end: 53423700 },
    trackWidth,
    marginWidth: 50,
    multiplier: 3,
  });

  const trackStore = createTrackStoreMemo([transcriptTrack]);

  const dataStore = createDataStoreMemo();

  return (
    <GQLWrapper>
      <Stack sx={{ height: "100%" }}>
        {/* Buttons Stack */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent={"space-between"}
          alignItems={{ xs: "stretch", md: "center" }}
          sx={toolbarSx}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            sx={searchGroupSx}
          >
            <Box sx={searchWrapperSx}>
              <GenomeSearch
                size="small"
                assembly={ASSEMBLY}
                geneVersion={geneVersion}
                onSearchSubmit={handleSearchSubmit}
                queries={SEARCH_QUERIES}
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
                    sx: searchInputSx,
                  },
                }}
              />
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} sx={actionsSx}>
            <HighlightDialog browserStore={browserStore} />
            {/* Track Select here */}
          </Stack>
        </Stack>
        {/* Controls stack */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          justifyContent={"space-between"}
          alignItems={"center"}
          sx={controlsSx}
        >
          <DomainDisplay browserStore={browserStore} assembly={ASSEMBLY} />
          <ControlButtons browserStore={browserStore} />
        </Stack>
        <Browser
          browserStore={browserStore}
          trackStore={trackStore}
          externalDataStore={dataStore}
        />
      </Stack>
    </GQLWrapper>
  );
}
