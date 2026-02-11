"use client";
import { Typography, Box, Grid, Link as MuiLink, Stack } from "@mui/material";
import Image from "next/image";
import { LinkComponent } from "./LinkComponent";

export default function Footer() {
  const sections = [
    {
      title: "About us",
      links: [
        { name: "MOHD Data Portal", href: "/about" },
        { name: "Weng Lab", href: "https://www.umassmed.edu/zlab/" },
        { name: "Moore Lab", href: "https://sites.google.com/view/moore-lab/" },
        { name: "MOHD Consortium", href: "https://www.mohdconsortium.org/home" },
        { name: "UMass Chan Medical School", href: "https://www.umassmed.edu/" },
      ],
    },
    {
      title: "Explore/Tools",
      links: [
        { name: "SCREEN", href: "https://screen.wenglab.org/" },
        { name: "PsychSCREEN", href: "https://psychscreen.wenglab.org/psychscreen" },
        { name: "igSCREEN", href: "https://igscreen.vercel.app/" },
        { name: "Factorbook", href: "https://www.factorbook.org/" },
      ],
    },
    {
      title: "Data",
      links: [
        { name: "Downloads", href: "/downloads" },
      ],
    },
    {
      title: "Help",
      links: [
        { name: "API Documentation", href: "/about#api-documentation" },
        { name: "Citations", href: "/about#citations" },
        { name: "Contact Us/Feedback", href: "/about#contact-us" },
      ],
    },
  ];

  return (
    <Box
      id="Footer"
      component="footer"
      sx={{
        width: "100%",
        backgroundColor: (theme) => theme.palette.primary.main,
        zIndex: (theme) => theme.zIndex.appBar,
        color: "#fff",
        paddingX: 6,
      }}
    >
      <Grid container spacing={6} my={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={1} alignItems="flex-start">
            <Stack direction={"row"} alignItems={"flex-end"} spacing={2}>
              <Image src={"/logo.png"} alt="Logo" width={60} height={60} />
              <Stack>
                <Typography variant="body1" sx={{ textAlign: "left" }}>
                  Multiomics for Health and Diseases
                </Typography>
                <Typography variant="body1" sx={{ textAlign: "left" }}>
                  Data Portal
                </Typography>
              </Stack>
            </Stack>
            <Typography variant="body2">
              Copyright ©{" "}
              <MuiLink color="inherit" href="https://www.umassmed.edu/zlab/">
                Weng Lab
              </MuiLink>
              ,{" "}
              <MuiLink color="inherit" href="https://sites.google.com/view/moore-lab/">
                Moore Lab
              </MuiLink>{" "}
              {new Date().getFullYear()}.
            </Typography>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={4}>
            {sections.map((section) => (
              <Grid size={{ xs: 6, sm: 3 }} key={section.title}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {section.title}
                </Typography>
                <Stack spacing={0.5}>
                  {section.links.map((link) => (
                    <LinkComponent
                      href={link.href}
                      key={link.name}
                      underline="none"
                      color="inherit"
                      width={"fit-content"}
                      variant="subtitle2"
                    >
                      {link.name}
                    </LinkComponent>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
