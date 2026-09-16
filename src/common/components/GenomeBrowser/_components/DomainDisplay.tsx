import { gql as screenGql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Box, Stack, Typography } from "@mui/material";
import { hg38, type BrowserStoreInstance } from "@weng-lab/genomebrowser";
import { Cytobands, type CytobandsProps } from "@weng-lab/genomebrowser-ui";
import { useMemo } from "react";

const CYTOBANDS_WIDTH = 700;
const CYTOBANDS_HEIGHT = 20;

/**
 * v1's <Cytobands> fetched its own band data. v2 made the component data-only,
 * so the band records are loaded here, from the same SCREEN API the v1 browser
 * used (through this app's /api/screen-graphql proxy).
 *
 * Aliased tag name: this query targets the SCREEN schema, and graphql-codegen
 * only validates `gql` documents against the MOHD schema.
 */
const GET_CYTOBANDS = screenGql(`
  query cytobands($assembly: String!, $chromosome: String) {
    cytoband(assembly: $assembly, chromosome: $chromosome) {
      stain
      coordinates {
        chromosome
        start
        end
      }
    }
  }
`);

type CytobandsQuery = {
  cytoband: {
    stain: string;
    coordinates: { chromosome: string; start: number; end: number };
  }[];
};

type Band = CytobandsProps["bands"][number];

export default function DomainDisplay({ useBrowserStore }: { useBrowserStore: BrowserStoreInstance }) {
  // The store hook is passed in as a prop, so the compiler can't prove it's the same
  // function every render. These controls render outside <GenomeBrowser>, so the
  // store context hooks aren't available here.
  // react-doctor-disable-next-line react-hooks-js/hooks
  const region = useBrowserStore((state) => state.region);
  // react-doctor-disable-next-line react-hooks-js/hooks
  const highlights = useBrowserStore((state) => state.highlights);
  // react-doctor-disable-next-line react-hooks-js/hooks
  const setRegion = useBrowserStore((state) => state.setRegion);

  const { data } = useQuery<CytobandsQuery>(GET_CYTOBANDS, {
    variables: { assembly: hg38.id, chromosome: region.chromosome },
  });

  const bands = useMemo<Band[]>(
    () =>
      (data?.cytoband ?? []).map((band) => ({
        chromosome: band.coordinates.chromosome,
        start: band.coordinates.start,
        end: band.coordinates.end,
        // The SCREEN cytoband records carry no band name; only the stain drives rendering.
        name: "",
        stain: band.stain,
      })),
    [data]
  );

  const chromosomeLength = hg38.chromosomes[region.chromosome];

  return (
    <Stack alignItems="center" width="100%" maxWidth={CYTOBANDS_WIDTH}>
      <Typography>
        {region.chromosome}:{region.start.toLocaleString()}-{region.end.toLocaleString()}
      </Typography>
      {/* Cytobands renders a fixed-size <svg> with a viewBox; scale it to the container like v1 did. */}
      <Box
        minHeight={CYTOBANDS_HEIGHT}
        width="100%"
        display="flex"
        alignItems="flex-end"
        sx={{ "& svg": { width: "100%", height: "auto" } }}
      >
        {chromosomeLength && bands.length > 0 ? (
          <Cytobands
            chromosome={region.chromosome}
            chromosomeLength={chromosomeLength}
            bands={bands}
            width={CYTOBANDS_WIDTH}
            height={CYTOBANDS_HEIGHT}
            currentRegion={region}
            highlights={highlights}
            // Clicking a highlight on the ideogram jumps the browser to it.
            onHighlightClick={(highlight) =>
              setRegion({
                chromosome: highlight.region.chromosome ?? region.chromosome,
                start: highlight.region.start,
                end: highlight.region.end,
              })
            }
          />
        ) : null}
      </Box>
    </Stack>
  );
}
