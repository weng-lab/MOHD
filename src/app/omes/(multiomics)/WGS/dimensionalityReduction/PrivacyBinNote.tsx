import { Box, Typography } from "@mui/material";

/** The privacy bin's chip tooltip: the categories folded into it, without counts. */
const PrivacyBinNote = ({ members }: { members: readonly string[] }) => (
  <>
    <Typography variant="caption" component="p">
      Combined to protect participant privacy:
    </Typography>
    <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
      {members.map((member) => (
        <Typography key={member} component="li" variant="caption">
          {member}
        </Typography>
      ))}
    </Box>
  </>
);

export default PrivacyBinNote;
