"use client";
import { AppBar, Box, Toolbar, IconButton, Stack, Typography } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { Search } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { LinkComponent } from "../LinkComponent";
import { useMenuControl } from "./MenuContext";
import MobileMenu from "./MobileMenu";
import NavDropdown from "./NavDropdown";
import { PageInfo } from "./types";
import AutoComplete from "../autocomplete";

const pageLinks: PageInfo[] = [
  {
    pageName: "Genome Browser",
    link: "/genomeBrowser",
  },
  {
    pageName: "Explore Data",
    subPages: [
      { pageName: "Dimensionality Reduction", link: "/dimensionalityReduction" },
      { pageName: "Clinical & Phenotypic Data", link: "/clinical" },
    ],
  },
  {
    pageName: "About",
    link: "https://www.mohdconsortium.org/home",
  },
  {
    pageName: "Help",
    link: "/help",
  },
];

type ResponsiveAppBarProps = {
  maintenance?: boolean;
};

function Header({ maintenance }: ResponsiveAppBarProps) {
  const { openMenu } = useMenuControl();

  return (
    // Sticky through the prop rather than sx: left at its default of "fixed", AppBar is tagged mui-fixed, and
    // MUI's scroll lock - any open Popover, Menu or Dialog - then pads it for the scrollbar it hides on
    // top of padding the body, pushing the search box that width to the left.
    <AppBar position="sticky">
      <Stack
        direction={"row"}
        style={{
          width: "100%",
          height: "40px",
          backgroundColor: "#ff9800",
          color: "#fff",
          textAlign: "center",
          display: maintenance ? "default" : "none",
        }}
        justifyContent={"center"}
        alignItems={"center"}
        spacing={2}
      >
        <WarningAmberIcon />
        <Typography sx={{ fontWeight: "bold" }}>
          MOHD API is temporarily unavailable. We are working to resolve the issue and will be back shortly.
        </Typography>
        <WarningAmberIcon />
      </Stack>
      <Toolbar sx={{ justifyContent: "space-between", backgroundColor: "white", minHeight: "64px" }}>
        {/* Main navigation items for desktop */}
        <Stack direction={"row"} spacing={3}>
          <Box component={Link} href={"/"} height={45} width={45} position={"relative"}>
            <Image
              priority
              src="/logo.png"
              width={45}
              height={45}
              alt="logo"
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </Box>
          {pageLinks.map((page) =>
            "subPages" in page ? (
              <NavDropdown key={page.pageName} pageName={page.pageName} subPages={page.subPages} />
            ) : (
              <Box key={page.pageName} display={{ xs: "none", md: "flex" }} alignItems={"center"} sx={{ mr: 2 }}>
                <LinkComponent
                  display={"flex"}
                  color="black"
                  href={page.link}
                  underline="none"
                  target={page.link.startsWith("http") ? "_blank" : undefined}
                  rel={page.link.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {page.pageName}
                </LinkComponent>
              </Box>
            )
          )}
        </Stack>
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            borderTopLeftRadius: "50px",
            borderBottomLeftRadius: "50px",
            backgroundColor: "primary.main",
            height: "100%",
            // Absolutely positioned, so nothing stops it sliding over the nav links on its left.
            // Below ~1050px it narrows to leave them the 600px they need.
            width: "min(450px, calc(100vw - 600px))",
            position: "absolute",
            right: 0,
            p: 2,
          }}
        >
          <AutoComplete
            style={{ width: 415, maxWidth: "100%" }}
            id="desktop-search-component"
            slots={{
              button: IconButton,
            }}
            slotProps={{
              button: { sx: { color: "white" }, children: <Search /> },
              box: { gap: 1 },
              input: {
                size: "small",
                label: `Search MOHD or SCREEN`,
                placeholder: "Search MOHD or SCREEN",
                sx: {
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#336460",
                    borderRadius: "999px",
                    color: "white",
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                    "& input": {
                      color: "white",
                    },
                    "& input::placeholder": {
                      color: "rgba(255, 255, 255, 0.85)",
                      opacity: 1,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.85)",
                    "&.Mui-focused": { color: "white" },
                  },
                  "& .MuiInputLabel-shrink": {
                    display: "none",
                  },
                },
              },
            }}
          />
        </Box>
        {/* mobile view */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            justifyContent: "center",
            borderTopLeftRadius: "50px",
            borderBottomLeftRadius: "50px",
            backgroundColor: "primary.main",
            height: "100%",
            width: "70px",
            position: "absolute",
            right: 0,
          }}
        >
          <IconButton size="large" onClick={openMenu} sx={{ color: "white" }}>
            <MenuIcon />
          </IconButton>
        </Box>
        <MobileMenu pageLinks={pageLinks} />
      </Toolbar>
    </AppBar>
  );
}
export default Header;
