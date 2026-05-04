import { Box, Stack, Typography } from "@mui/material";
import {  Cytobands } from "@weng-lab/genomebrowser";
import { useBrowserStore } from "../stores";

export default function DomainDisplay() {
  const domain = useBrowserStore((state) => state.domain);

  return (
    <Stack alignItems="center" width="100%" maxWidth={700}>
      <Typography>
        {domain.chromosome}:{domain.start.toLocaleString()}-
        {domain.end.toLocaleString()}
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
