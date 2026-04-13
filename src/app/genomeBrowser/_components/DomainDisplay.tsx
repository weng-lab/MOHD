import { Box, Stack, Typography } from "@mui/material";
import { BrowserStoreInstance, Cytobands } from "@weng-lab/genomebrowser";

export default function DomainDisplay({ browserStore }: { browserStore: BrowserStoreInstance }) {
  const currentDomain = browserStore((state) => state.domain);

  return (
    <Stack alignItems="center" width="100%" maxWidth={700}>
      <Typography>
        {currentDomain.chromosome}:{currentDomain.start.toLocaleString()}-{currentDomain.end.toLocaleString()}
      </Typography>
      <Box minHeight={20} width="100%" display="flex">
        <svg
          width="100%"
          height={20}
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 700 20"
          style={{ alignSelf: "flex-end" }}
        >
          <Cytobands assembly="hg38" currentDomain={currentDomain} />
        </svg>
      </Box>
    </Stack>
  );
}
