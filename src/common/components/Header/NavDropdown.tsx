"use client";
import { useId, useState, type MouseEvent } from "react";
import { Box, Link as MuiLink, Menu, MenuItem } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Link from "next/link";
import { PageLink } from "./types";

type NavDropdownProps = {
  pageName: string;
  subPages: PageLink[];
};

/** A header entry with no page of its own, listing its pages on hover, or on a click for touch screens and keyboards. */
export default function NavDropdown({ pageName, subPages }: NavDropdownProps) {
  const menuId = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const open = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);
  const close = () => setAnchor(null);

  return (
    // The menu is portaled, but React counts it as inside this box, so moving onto it doesn't leave.
    <Box display={{ xs: "none", md: "flex" }} alignItems={"center"} onMouseLeave={close} sx={{ mr: 2 }}>
      <MuiLink
        component="button"
        display={"flex"}
        color="black"
        underline="none"
        onMouseEnter={open}
        onClick={open}
        aria-haspopup="true"
        aria-expanded={Boolean(anchor)}
        aria-controls={anchor ? menuId : undefined}
      >
        {pageName}
        <ArrowDropDownIcon />
      </MuiLink>
      <Menu
        id={menuId}
        anchorEl={anchor}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={Boolean(anchor)}
        onClose={close}
        // Leaves the page its scrollbar, as the Omes popover does.
        disableScrollLock
        // Focuses the menu rather than its first item, which would look chosen when opened by hover. Arrow keys still reach it.
        disableAutoFocusItem
        slotProps={{ paper: { sx: { pointerEvents: "auto" } } }}
        // Lets the pointer through the menu's invisible backdrop, so moving off onto the page closes it.
        sx={{ pointerEvents: "none" }}
      >
        {subPages.map((subPage) => (
          <MenuItem key={subPage.pageName} component={Link} href={subPage.link} onClick={close}>
            {subPage.pageName}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
