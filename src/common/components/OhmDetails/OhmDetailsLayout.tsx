"use client";
import { Box, Divider, Stack } from "@mui/material";
import OhmDetailsTabs from "./OhmDetailsTabs";
import { OhmsDataType } from "@/common/types/globalTypes";
import { OhmHeader } from "./OhmHeader";

export type OhmDetailsLayoutProps = {
    ohm: OhmsDataType;
} & { children: React.ReactNode };

const tabs = [
    { label: "Dimensionality Reduction", iconPath: "/logo.png", route: "overview" },
    { label: "Heat Map", iconPath: "/logo.png", route: "figures" },
    { label: "Downloads", iconPath: "/logo.png", route: "data-table" },
];

export default function OhmDetailsLayout({ ohm, children }: OhmDetailsLayoutProps) {

    return (
        <OhmHeader>
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
                    bgcolor={"#F2F2F2"}
                    position={"sticky"}
                    top={"calc(var(--header-height, 64px) + var(--Ohm-tabs-height, 48px))"}
                    maxHeight={"calc(100vh - var(--header-height, 64px) - var(--Ohm-tabs-height, 48px))"}
                    display={{ xs: "none", md: "block" }}
                >
                    <OhmDetailsTabs ohm={ohm} tabs={tabs} orientation="vertical" />
                </Box>
                <Stack id="main-content" spacing={2} m={2} gridColumn={{ xs: 1, md: 2 }} gridRow={{ xs: 2, md: 1 }}>
                    <Box id="horizonatal-view-tabs-container" display={{ xs: "block", md: "none" }}>
                        <OhmDetailsTabs
                            ohm={ohm}
                            tabs={tabs}
                            orientation="horizontal"
                        />
                        <Divider />
                    </Box>
                    {children}
                </Stack>
            </Box>
        </OhmHeader>
    );
}
