import { Box, Stack, Typography } from "@mui/material";
import { Cytobands, type BrowserStoreInstance } from "@weng-lab/genomebrowser";

export default function DomainDisplay({ useBrowserStore }: { useBrowserStore: BrowserStoreInstance }) {
  // The store hook is passed in as a prop, so the compiler can't prove it's the same
  // function every render. Suppressed while @weng-lab/genomebrowser reworks its public API.
  // react-doctor-disable-next-line react-hooks-js/hooks
  const domain = useBrowserStore((state) => state.domain);

  return (
    <Stack alignItems="center" width="100%" maxWidth={700}>
      <Typography>
        {domain.chromosome}:{domain.start.toLocaleString()}-{domain.end.toLocaleString()}
      </Typography>
      <Box minHeight={20} width="100%" display="flex">
        <svg
          width="100%"
          height={20}
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 700 20"
          style={{ alignSelf: "flex-end" }}
        >
          <Cytobands assembly="hg38" currentDomain={domain} />
        </svg>
      </Box>
    </Stack>
  );
}
