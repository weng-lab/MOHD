"use client";
import { Box, Divider, Stack } from "@mui/material";
import OmeDetailsTabs from "./OmeDetailsTabs";
import { OmeDetailsTab, OmesDataType } from "@/common/types/globalTypes";
import { OmeHeader } from "./OmeHeader";
import { usePathname } from "next/navigation";

export type OmeDetailsLayoutProps = {
} & { children: React.ReactNode };

const logo = "/logo.png";

export const OME_TABS: Record<OmesDataType, OmeDetailsTab[]> = {
    WGS: [
        { label: "Dimensionality Reduction", iconPath: logo, route: "dimensionalityReduction" },
        { label: "Genetic Ancestry Composition", iconPath: logo, route: "ancestryComposition" },
        { label: "Downloads", iconPath: logo, route: "downloads" },
    ],

    WGBS: [
        { label: "Dimensionality Reduction", iconPath: logo, route: "dimensionalityReduction" },
        { label: "Cell Type Decomposition", iconPath: logo, route: "cellTypeDecomposition" },
        { label: "Genome Browser", iconPath: logo, route: "genomeBrowser" },
        { label: "Downloads", iconPath: logo, route: "downloads" },
    ],

    ATAC: [
        { label: "Dimensionality Reduction", iconPath: logo, route: "dimensionalityReduction" },
        { label: "Cell Type Decomposition", iconPath: logo, route: "cellTypeDecomposition" },
        { label: "Genome Browser", iconPath: logo, route: "genomeBrowser" },
        { label: "Downloads", iconPath: logo, route: "downloads" },
    ],

    RNA: [
        { label: "Dimensionality Reduction", iconPath: logo, route: "dimensionalityReduction" },
        { label: "Cell Type Decomposition", iconPath: logo, route: "cellTypeDecomposition" },
        { label: "Genome Browser", iconPath: logo, route: "genomeBrowser" },
        { label: "Downloads", iconPath: logo, route: "downloads" },
    ],

    proteomics: [
        { label: "Dimensionality Reduction", iconPath: logo, route: "dimensionalityReduction" },
        { label: "Heatmap", iconPath: logo, route: "heatmap" },
        { label: "Downloads", iconPath: logo, route: "downloads" },
    ],

    metabolomics: [
        { label: "Dimensionality Reduction", iconPath: logo, route: "dimensionalityReduction" },
        { label: "Heatmap", iconPath: logo, route: "heatmap" },
        { label: "Downloads", iconPath: logo, route: "downloads" },
    ],

    lipidomics: [
        { label: "Dimensionality Reduction", iconPath: logo, route: "dimensionalityReduction" },
        { label: "Heatmap", iconPath: logo, route: "heatmap" },
        { label: "Downloads", iconPath: logo, route: "downloads" },
    ],

    exposomics: [
        { label: "Dimensionality Reduction", iconPath: logo, route: "dimensionalityReduction" },
        { label: "Heatmap", iconPath: logo, route: "heatmap" },
    ],

    metallomics: [
        { label: "Dimensionality Reduction", iconPath: logo, route: "dimensionalityReduction" },
    ]
};


export default function OmeDetailsLayout({ children }: OmeDetailsLayoutProps) {
    const pathname = usePathname();
    const ome = pathname.split("/")[2] as OmesDataType;
        
    const tabs = OME_TABS[ome];

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
                    bgcolor={"#F2F2F2"}
                    position={"sticky"}
                    top={"calc(var(--header-height, 64px) + var(--Ome-tabs-height, 48px))"}
                    maxHeight={"calc(100vh - var(--header-height, 64px) - var(--Ome-tabs-height, 48px))"}
                    display={{ xs: "none", md: "block" }}
                >
                    <OmeDetailsTabs ome={ome} tabs={tabs} orientation="vertical" />
                </Box>
                <Stack id="main-content" spacing={2} m={2} gridColumn={{ xs: 1, md: 2 }} gridRow={{ xs: 2, md: 1 }}>
                    <Box id="horizonatal-view-tabs-container" display={{ xs: "block", md: "none" }}>
                        <OmeDetailsTabs
                            ome={ome}
                            tabs={tabs}
                            orientation="horizontal"
                        />
                        <Divider />
                    </Box>
                    {children}
                </Stack>
            </Box>
        </OmeHeader>
    );
}
