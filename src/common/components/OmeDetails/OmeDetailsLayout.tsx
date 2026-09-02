"use client";
import { Box, Divider, Stack } from "@mui/material";
import { OmeHeader } from "./OmeHeader";
import { usePathname } from "next/navigation";
import { DetailsTabs } from "@weng-lab/ui-components";
import Link from "next/link";
import { OME_TABS } from "@/common/components/OmeDetails/omeTabs";
import type { OmesDataType } from "@/common/types/globalTypes";
import { useOmeHeaderHeight } from "@/common/hooks/useOmeHeaderHeight";

export type OmeDetailsLayoutProps = {
} & { children: React.ReactNode };


export default function OmeDetailsLayout({ children }: OmeDetailsLayoutProps) {
    const pathname = usePathname();
    const ome = pathname.split("/")[2] as OmesDataType;

    const tabs = OME_TABS[ome];

    // #ome-header only exists on ome pages, so it is measured here rather than at the app root.
    useOmeHeaderHeight();

    return (
        <OmeHeader>
            <Box
                id="split-pane-container"
                display={"grid"}
                height={"100%"}
                gridTemplateColumns={{ xs: "minmax(0, 1fr)", md: "auto minmax(0, 1fr)" }}
            >
                <Box
                    id="vertical-view-tabs-container"
                    gridColumn={1}
                    gridRow={1}
                    bgcolor={"surface.light"}
                    position={"sticky"}
                    top={"calc(var(--header-height, 64px) + var(--ome-header-height, 66px))"}
                    maxHeight={"calc(100vh - var(--header-height, 64px) - var(--ome-header-height, 66px))"}
                    display={{ xs: "none", md: "block" }}
                >
                    <DetailsTabs
                        tabs={tabs}
                        value={pathname.substring(pathname.lastIndexOf("/") + 1)}
                        orientation="vertical"
                        LinkComponent={Link}
                        selectedBackgroundColor="#e1edec"
                        sx={{
                            position: "sticky",
                            top: "calc(var(--header-height, 64px) + var(--ome-header-height, 66px))",
                            width: 100,
                            maxHeight: "100%",
                        }}
                        iconHeight={50}
                        iconWidth={50}
                    />
                </Box>
                <Stack id="main-content" spacing={2} mx={2} mb={2} gridColumn={{ xs: 1, md: 2 }} gridRow={1}>
                    <Box id="horizonatal-view-tabs-container" display={{ xs: "block", md: "none" }}>
                        <DetailsTabs
                            tabs={tabs}
                            value={pathname.substring(pathname.lastIndexOf("/") + 1)}
                            orientation="horizontal"
                            LinkComponent={Link}
                            selectedBackgroundColor="#e1edec"
                            sx={{
                                position: "sticky",
                                top: "calc(var(--header-height, 64px) + var(--ome-header-height, 66px))",
                            }}
                            iconHeight={40}
                            iconWidth={40}
                        />
                        <Divider />
                    </Box>
                    {children}
                </Stack>
            </Box>
        </OmeHeader>
    );
}
