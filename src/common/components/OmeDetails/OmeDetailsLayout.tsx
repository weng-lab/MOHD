"use client";
import { Box, Divider, Stack } from "@mui/material";
import OmeDetailsTabs from "./OmeDetailsTabs";
import { OmeDetailsTab, OmesDataType } from "@/common/types/globalTypes";
import { OmeHeader } from "./OmeHeader";
import { usePathname } from "next/navigation";

export type OmeDetailsLayoutProps = {
} & { children: React.ReactNode };

const logo = "/logo.png";
const dimesnionalityReductionIcon = "/TabIcons/DimensionReduction.png";
const cellTypeDecompositionIcon = "/TabIcons/CellTypeDeconvolution.png";
const downloadIcon = "/TabIcons/DataDownload.png";
const genomeBrowserIcon = "/TabIcons/genomeBrowser.png";
const heatmapIcon = "/TabIcons/Heatmap.png";

export const OME_TABS: Record<OmesDataType, OmeDetailsTab[]> = {
    WGS: [
        { label: "Dimensionality Reduction", iconPath: dimesnionalityReductionIcon, route: "dimensionalityReduction" },
        { label: "Genetic Ancestry Composition", iconPath: logo, route: "ancestryComposition" },
        { label: "Downloads", iconPath: downloadIcon, route: "downloads" },
    ],

    WGBS: [
        { label: "Dimensionality Reduction", iconPath: dimesnionalityReductionIcon, route: "dimensionalityReduction" },
        { label: "Cell Type Decomposition", iconPath: cellTypeDecompositionIcon, route: "cellTypeDecomposition" },
        { label: "Genome Browser", iconPath: genomeBrowserIcon, route: "genomeBrowser" },
        { label: "Downloads", iconPath: downloadIcon, route: "downloads" },
    ],

    ATAC: [
        { label: "Dimensionality Reduction", iconPath: dimesnionalityReductionIcon, route: "dimensionalityReduction" },
        { label: "Cell Type Decomposition", iconPath: cellTypeDecompositionIcon, route: "cellTypeDecomposition" },
        { label: "Genome Browser", iconPath: genomeBrowserIcon, route: "genomeBrowser" },
        { label: "Downloads", iconPath: downloadIcon, route: "downloads" },
    ],

    RNA: [
        { label: "Dimensionality Reduction", iconPath: dimesnionalityReductionIcon, route: "dimensionalityReduction" },
        { label: "Cell Type Decomposition", iconPath: cellTypeDecompositionIcon, route: "cellTypeDecomposition" },
        { label: "Genome Browser", iconPath: genomeBrowserIcon, route: "genomeBrowser" },
        { label: "Downloads", iconPath: downloadIcon, route: "downloads" },
    ],

    proteomics: [
        { label: "Dimensionality Reduction", iconPath: dimesnionalityReductionIcon, route: "dimensionalityReduction" },
        { label: "Heatmap", iconPath: heatmapIcon, route: "heatmap" },
        { label: "Downloads", iconPath: downloadIcon, route: "downloads" },
    ],

    metabolomics: [
        { label: "Dimensionality Reduction", iconPath: dimesnionalityReductionIcon, route: "dimensionalityReduction" },
        { label: "Heatmap", iconPath: heatmapIcon, route: "heatmap" },
        { label: "Downloads", iconPath: downloadIcon, route: "downloads" },
    ],

    lipidomics: [
        { label: "Dimensionality Reduction", iconPath: dimesnionalityReductionIcon, route: "dimensionalityReduction" },
        { label: "Heatmap", iconPath: heatmapIcon, route: "heatmap" },
        { label: "Downloads", iconPath: downloadIcon, route: "downloads" },
    ],

    exposomics: [
        { label: "Dimensionality Reduction", iconPath: dimesnionalityReductionIcon, route: "dimensionalityReduction" },
        { label: "Heatmap", iconPath: heatmapIcon, route: "heatmap" },
        { label: "Downloads", iconPath: downloadIcon, route: "downloads" },
    ],

    metallomics: [
        { label: "Dimensionality Reduction", iconPath: dimesnionalityReductionIcon, route: "dimensionalityReduction" },
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
