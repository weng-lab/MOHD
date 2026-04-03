"use client";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MuiLink from "@mui/material/Link";;
import Link from "next/link";
import CloseIcon from "@mui/icons-material/Close";
import { useMenuControl } from "./MenuContext";
import { useEffect } from "react";
import { PageInfo } from "./types";
import { Search } from "@mui/icons-material";
import AutoComplete from "../autocomplete";

export type MobileMenuProps = {
  pageLinks: PageInfo[];
};

export default function MobileMenu({ pageLinks }: MobileMenuProps) {
  const { isMenuOpen, setMenuCanBeOpen, closeMenu, setIsMenuMounted } = useMenuControl();

  const theme = useTheme();
  // This breakpoint needs to match the breakpoints used below
  // Not using this below to prevent layout shift on initial load
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    if (isDesktop) {
      setMenuCanBeOpen(false);
    } else setMenuCanBeOpen(true);
  }, [isDesktop, setMenuCanBeOpen]);

  const handleCloseDrawer = () => {
    setIsMenuMounted(false);
    closeMenu();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={isMenuOpen}
        onClose={handleCloseDrawer}
        SlideProps={{
          onEntered: () => setIsMenuMounted(true),
          onExited: () => setIsMenuMounted(false),
        }}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <IconButton sx={{ color: "primary.main" }} onClick={handleCloseDrawer}>
            <CloseIcon />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50px",
              backgroundColor: "primary.main",
              height: "60px",
              width: "100%",
              p: 2,
            }}
          >
          <AutoComplete
            style={{ width: "100%" }}
            id="desktop-search-component"
            slots={{
              button: (
                <IconButton sx={{ color: "white" }}>
                  <Search />
                </IconButton>
              ),
            }}
            slotProps={{
              box: { gap: 1 },
              input: {
                size: "small",
                label: `Search MOHD or SCREEN`,
                placeholder: "Search MOHD or SCREEN",
                sx: {
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    borderRadius: "999px",
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#666666",
                    "&.Mui-focused": { color: "#444444" },
                  },
                  "& .MuiInputLabel-shrink": {
                    display: "none",
                  },
                },
              },
            }}
          />
          </Box>
          <List>
            {pageLinks.map((page) => (
              <Box key={page.pageName} sx={{ mb: 1 }}>
                <ListItem onClick={handleCloseDrawer}>
                  <MuiLink
                    component={Link}
                    href={page.link}
                    sx={{
                      color: "black",
                      textTransform: "none",
                      justifyContent: "start",
                      width: "100%",
                      fontFamily: "inherit",
                    }}
                    underline="none"
                  >
                    {page.pageName}
                  </MuiLink>
                </ListItem>
                {page.subPages && (
                  <List sx={{ pl: 2 }}>
                    {page.subPages.map((subPage) => (
                      <ListItem key={subPage.pageName} sx={{ py: 0 }} onClick={handleCloseDrawer}>
                        <MuiLink
                          component={Link}
                          href={subPage.link}
                          sx={{ color: "gray", textTransform: "none", fontFamily: "inherit" }}
                          underline="none"
                        >
                          {subPage.pageName}
                        </MuiLink>
                      </ListItem>
                    ))}
                  </List>
                )}
                <Divider />
              </Box>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
