import { OmesList } from "@/common/types/globalTypes";
import { Button, Link, Stack, Typography } from "@mui/material";

export default function MolecularDataLanding() {
  return (
     <Stack spacing={2}>
      <Typography>Molecular Data Landing Page</Typography>

      <Stack direction="row" spacing={2} flexWrap="wrap">
        {OmesList.map((ome) => (
          <Button
            key={ome}
            component={Link}
            href={`/omes/${ome}/dimensionalityReduction`}
            variant="contained"
          >
            {ome}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
