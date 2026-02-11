import { Box, Button, Stack, Typography } from "@mui/material";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Box
        width="100%"
        height={"auto"}
        paddingY={10}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: "primary.light"
        }}
      >
        <Stack
          alignItems="center"
          justifyContent={"flex-start"}
          spacing={1}
          textAlign={{ xs: "center", md: "left" }}
        >
          <Image
            src="/logo.png"
            alt="logo"
            height={150}
            width={150}
            priority
            id="header-helix"
          />
          <Stack alignItems="center">
            <Typography variant="h4">
              <b>Multiomics for Health and Diseases</b>
            </Typography>
            <Typography variant="h5">
              <b>Data Portal</b>
            </Typography>
          </Stack>
          <Typography variant="body1">
            Explore our extensive omics data 10,000 samples across 1,800 participants.
          </Typography>
          <Stack direction={"row"} spacing={5}>
            <Button variant="contained" color="primary" href="/ohms">
              Test Molecular landing page
            </Button>
            <Button variant="contained" color="primary" href="/clinical">
              Test Clinical landing page
            </Button>
          </Stack>
        </Stack>
      </Box>
    </div>
  );
}
