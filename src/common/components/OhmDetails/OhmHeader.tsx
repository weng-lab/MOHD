import { Stack, Paper, Box, Typography } from "@mui/material";
import { usePathname } from "next/navigation";

export const OhmHeader = ({ children }: { children?: React.ReactNode }) => {
  const pathname = usePathname();
  const ohm = pathname.split("/")[2];

  return (
      <Box
        display={"grid"}
        height={"100%"}
        gridTemplateRows={"auto minmax(0, 1fr)"}
        gridTemplateColumns={"minmax(0, 1fr)"}
      >
        {/* z index of scrollbar in DataGrid is 60 */}
        <Paper
          elevation={1}
          square
          sx={{ position: "sticky", top: "var(--header-height, 64px)", zIndex: 61 }}
          id="ohm-header"
        >
          <Stack direction={"row"}>
            <Typography variant="h5" p={2}>
                {ohm}
            </Typography>
          </Stack>
        </Paper>
        {children}
      </Box>
  );
};
