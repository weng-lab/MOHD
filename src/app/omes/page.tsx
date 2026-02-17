import { Stack, Typography } from "@mui/material";
import OmeCards from "./OmeCards";
import { Box } from "@mui/system";

export default function MolecularDataLanding() {
  return (
    <Stack spacing={2}>
      <Typography>Molecular Data Landing Page</Typography>
      <Box padding={5}>
        <OmeCards />
      </Box>
    </Stack>
  );
}
