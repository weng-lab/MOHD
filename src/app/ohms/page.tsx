import { OhmsList } from "@/common/types/globalTypes";
import { Button, Link, Stack, Typography } from "@mui/material";

export default function MolecularDataLanding() {
  return (
     <Stack spacing={2}>
      <Typography>Molecular Data Landing Page</Typography>

      <Stack direction="row" spacing={2} flexWrap="wrap">
        {OhmsList.map((ohm) => (
          <Button
            key={ohm}
            component={Link}
            href={`/ohms/${ohm}/dimensionalityReduction`}
            variant="contained"
          >
            {ohm}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
