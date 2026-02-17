"use client";
import * as React from "react";
import { AppBar, Box, Toolbar, Menu, MenuItem, IconButton, Stack, Typography } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Link from "next/link";
import Image from "next/image";
import { Search } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { LinkComponent } from "../LinkComponent";
import { useMenuControl } from "./MenuContext";
import MobileMenu from "./MobileMenu";
import { PageInfo } from "./types";
import AutoComplete from "../autocomplete";

const pageLinks: PageInfo[] = [
    {
        pageName: "Home",
        link: "/",
    },
    {
        pageName: "Downloads",
        link: "/downloads",
    },
    {
        pageName: "About",
        link: "/about",
        dropdownID: 0,
        subPages: [
            { pageName: "Overview", link: "/about" },
            { pageName: "Contact Us", link: "/about#contact-us" },
        ],
    },
    {
        pageName: "Help",
        link: "/about#contact-us",
    },
];

type ResponsiveAppBarProps = {
    maintenance?: boolean;
};

function Header({ maintenance }: ResponsiveAppBarProps) {
    const { openMenu } = useMenuControl();

    // Hover dropdowns, deals with setting its position
    const [anchorDropdown0, setAnchorDropdown0] = useState<null | HTMLElement>(null);
    const [anchorDropdown1, setAnchorDropdown1] = useState<null | HTMLElement>(null);

    //Auto scroll and focus the main search bar
    // const handleFocusSearch = () => {
    //     const searchEl = document.getElementById("main-search-component");
    //     const headerEl = document.getElementById("header-helix");
    //     if (!searchEl) return;

    //     const observer = new IntersectionObserver(
    //         ([entry], obs) => {
    //             if (entry.isIntersecting) {
    //                 searchEl.focus();
    //                 obs.disconnect();
    //             }
    //         },
    //         {
    //             threshold: 1.0,
    //         }
    //     );

    //     observer.observe(headerEl);

    //     // Scroll smoothly to the search bar
    //     searchEl.scrollIntoView({ behavior: "smooth", block: "center" });
    // };

    // Open Dropdown
    const handleOpenDropdown = (event: React.MouseEvent<HTMLElement>, dropdownID: number) => {
        if (dropdownID === 0) {
            setAnchorDropdown0(event.currentTarget);
        } else if (dropdownID === 1) {
            setAnchorDropdown1(event.currentTarget);
        }
    };

    // Close Dropdown
    const handleCloseDropdown = (dropdownID: number) => {
        if (dropdownID === 0) {
            setAnchorDropdown0(null);
        } else if (dropdownID === 1) {
            setAnchorDropdown1(null);
        }
    };

    const handleMouseMoveLink = (event: React.MouseEvent<HTMLElement>, page: PageInfo) => {
        if (page?.subPages && "dropdownID" in page && page.dropdownID !== undefined) {
            handleOpenDropdown(event, page.dropdownID);
        }
    };

    const handleMouseLeaveLink = (event: React.MouseEvent<HTMLElement>, page: PageInfo) => {
        if (page?.subPages && "dropdownID" in page) {
            switch (page.dropdownID) {
                case 0: {
                    if (anchorDropdown0) {
                        handleCloseDropdown(0);
                    }
                    break;
                }
                case 1: {
                    if (anchorDropdown1) {
                        handleCloseDropdown(1);
                    }
                    break;
                }
            }
        }
    };

    return (
        <AppBar sx={{ position: "sticky", top: 0 }}>
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
            <Toolbar sx={{ justifyContent: "space-between", backgroundColor: "white" }}>
                {/* Main navigation items for desktop */}
                <Stack direction={"row"} spacing={3} >
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
                    {pageLinks.map((page) => (
                        <Box
                            key={page.pageName}
                            display={{ xs: "none", md: "flex" }}
                            alignItems={"center"}
                            onMouseMove={(event) => handleMouseMoveLink(event, page)}
                            onMouseLeave={(event) => handleMouseLeaveLink(event, page)}
                            id="LinkBox"
                            sx={{ mr: 2, }}
                            
                        >
                            <LinkComponent
                                id="Link"
                                display={"flex"}
                                color="black"
                                href={page.link}
                                underline="none"
                            >
                                {page.pageName}
                                {page.subPages && <ArrowDropDownIcon />}
                            </LinkComponent>
                            {/* Create popup menu if page has subpages */}
                            {page.subPages && (
                                <Menu
                                    id={`${page.pageName}-dropdown-appbar`}
                                    // This logic would need to change when adding another dropdown
                                    anchorEl={page.dropdownID === 0 ? anchorDropdown0 : anchorDropdown1}
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "left",
                                    }}
                                    open={page.dropdownID === 0 ? Boolean(anchorDropdown0) : Boolean(anchorDropdown1)}
                                    onClose={() => page.dropdownID !== undefined && handleCloseDropdown(page.dropdownID)}
                                    slotProps={{
                                        paper: {
                                            onMouseLeave: () => page.dropdownID !== undefined && handleCloseDropdown(page.dropdownID),
                                            sx: { pointerEvents: "auto" },
                                        },
                                    }}
                                    sx={{ pointerEvents: "none", zIndex: 2000 }} //z index of AppBar is 1100 for whatever reason
                                >
                                    {page.subPages &&
                                        page.subPages.map((subPage) => (
                                            <LinkComponent key={subPage.pageName} color="#000000" href={subPage.link}>
                                                <MenuItem>{subPage.pageName}</MenuItem>
                                            </LinkComponent>
                                        ))}
                                </Menu>
                            )}
                        </Box>
                    ))}
                </Stack>
                {/* <IconButton sx={{ color: "white", display: { xs: "none", md: "flex" } }} onClick={handleFocusSearch}> */}
                <Box
                    sx={{
                        display: { xs: "none", md: "flex" },
                        alignItems: "center",
                        justifyContent: "center",
                        borderTopLeftRadius: "50px",
                        borderBottomLeftRadius: "50px",
                        backgroundColor: "primary.main",
                        height: "100%",
                        width: "450px",
                        position: "absolute",
                        right: 0,
                        p: 2,
                    }}
                >
                    {/* <IconButton
                        size="small"
                        sx={{
                            color: "white",
                            p: 0.5,
                        }}
                    >
                        <Search />
                    </IconButton> */}
                    <AutoComplete
                        style={{ width: 415 }}
                        id="desktop-search-component"
                        slots={{
                            button: (
                                <IconButton sx={{ color: "white" }}>
                                    <Search />
                                </IconButton>
                            ),
                        }}
                        assembly={"GRCh38"}
                        slotProps={{
                            box: { gap: 1 },
                            input: {
                                size: "small",
                                label: `Enter a ...`,
                                placeholder: "Enter a gene, cCRE, variant or locus",
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

                {/* mobile view */}
                <Box display={{ xs: "flex", md: "none" }} alignItems={"center"} gap={2}>
                    <IconButton size="large" onClick={openMenu} sx={{color: "primary.main"}}>
                        <MenuIcon />
                    </IconButton>
                </Box> 
                <MobileMenu pageLinks={pageLinks} />
            </Toolbar>
        </AppBar>
    );
}
export default Header;
