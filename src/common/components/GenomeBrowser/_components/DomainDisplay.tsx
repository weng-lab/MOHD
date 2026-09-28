import { gql as screenGql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Box } from "@mui/material";
import { hg38, type BrowserStoreInstance } from "@weng-lab/genomebrowser";
import { Cytobands, type CytobandsProps } from "@weng-lab/genomebrowser-ui";
import { useEffect, useMemo, useRef, useState } from "react";

const CYTOBANDS_HEIGHT = 14;

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

  // Cytobands takes an explicit pixel width, so the ideogram is measured against
  // its container to span the full track width instead of a fixed size.
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    const resize = () => setWidth(element.clientWidth);
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    // The toolbar's region search already displays the current coordinates, so this is ideogram-only.
    <Box ref={container} width="100%" minHeight={CYTOBANDS_HEIGHT} mt={1} mb={0.5}>
      {chromosomeLength && bands.length > 0 && width > 0 ? (
        <Cytobands
          chromosome={region.chromosome}
          chromosomeLength={chromosomeLength}
          bands={bands}
          width={width}
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
  );
}
