import type { TabItem } from "@weng-lab/ui-components";
import type { OmesDataType } from "@/common/types/globalTypes";

const logo = "/logo.png";
const dimensionalityReductionIcon = "/TabIcons/DimensionReduction.png";
const cellTypeDecompositionIcon = "/TabIcons/CellTypeDeconvolution.png";
const downloadIcon = "/TabIcons/DataDownload.png";
const heatmapIcon = "/TabIcons/Heatmap.png";
const gbIcon = "/TabIcons/genomeBrowser.png";

export const OME_TABS: Record<OmesDataType, TabItem[]> = {
    WGS: [
        { value: "dimensionalityReduction", label: "Dimensionality Reduction", icon: dimensionalityReductionIcon, href: "/omes/WGS/dimensionalityReduction" },
        { value: "ancestryComposition", label: "Genetic Ancestry Composition", icon: logo, href: "/omes/WGS/ancestryComposition" },
        { value: "downloads", label: "Downloads", icon: downloadIcon, href: "/omes/WGS/downloads" },
    ],
    WGBS: [
        { value: "dimensionalityReduction", label: "Dimensionality Reduction", icon: dimensionalityReductionIcon, href: "/omes/WGBS/dimensionalityReduction" },
        { value: "cellTypeDecomposition", label: "Cell Type Decomposition", icon: cellTypeDecompositionIcon, href: "/omes/WGBS/cellTypeDecomposition" },
        { value: "genomeBrowser", label: "Genome Browser", icon: gbIcon, href: "/omes/WGBS/genomeBrowser" },
        { value: "downloads", label: "Downloads", icon: downloadIcon, href: "/omes/WGBS/downloads" },
    ],
    ATAC: [
        { value: "dimensionalityReduction", label: "Dimensionality Reduction", icon: dimensionalityReductionIcon, href: "/omes/ATAC/dimensionalityReduction" },
        { value: "cellTypeDecomposition", label: "Cell Type Decomposition", icon: cellTypeDecompositionIcon, href: "/omes/ATAC/cellTypeDecomposition" },
        { value: "genomeBrowser", label: "Genome Browser", icon: gbIcon, href: "/omes/ATAC/genomeBrowser" },
        { value: "downloads", label: "Downloads", icon: downloadIcon, href: "/omes/ATAC/downloads" },
    ],
    RNA: [
        { value: "dimensionalityReduction", label: "Dimensionality Reduction", icon: dimensionalityReductionIcon, href: "/omes/RNA/dimensionalityReduction" },
        { value: "cellTypeDecomposition", label: "Cell Type Decomposition", icon: cellTypeDecompositionIcon, href: "/omes/RNA/cellTypeDecomposition" },
        { value: "genomeBrowser", label: "Genome Browser", icon: gbIcon, href: "/omes/RNA/genomeBrowser" },
        { value: "downloads", label: "Downloads", icon: downloadIcon, href: "/omes/RNA/downloads" },
    ],
    proteomics: [
        { value: "dimensionalityReduction", label: "Dimensionality Reduction", icon: dimensionalityReductionIcon, href: "/omes/proteomics/dimensionalityReduction" },
        { value: "heatmap", label: "Heatmap", icon: heatmapIcon, href: "/omes/proteomics/heatmap" },
        { value: "downloads", label: "Downloads", icon: downloadIcon, href: "/omes/proteomics/downloads" },
    ],
    metabolomics: [
        { value: "dimensionalityReduction", label: "Dimensionality Reduction", icon: dimensionalityReductionIcon, href: "/omes/metabolomics/dimensionalityReduction" },
        { value: "heatmap", label: "Heatmap", icon: heatmapIcon, href: "/omes/metabolomics/heatmap" },
        { value: "downloads", label: "Downloads", icon: downloadIcon, href: "/omes/metabolomics/downloads" },
    ],
    lipidomics: [
        { value: "heatmap", label: "Heatmap", icon: heatmapIcon, href: "/omes/lipidomics/heatmap" },
        { value: "downloads", label: "Downloads", icon: downloadIcon, href: "/omes/lipidomics/downloads" },
    ],
    exposomics: [
        { value: "dimensionalityReduction", label: "Dimensionality Reduction", icon: dimensionalityReductionIcon, href: "/omes/exposomics/dimensionalityReduction" },
        { value: "heatmap", label: "Heatmap", icon: heatmapIcon, href: "/omes/exposomics/heatmap" },
        { value: "downloads", label: "Downloads", icon: downloadIcon, href: "/omes/exposomics/downloads" },
    ],
    metallomics: [
        { value: "heatmap", label: "Heatmap", icon: heatmapIcon, href: "/omes/metallomics/heatmap" },
        { value: "downloads", label: "Downloads", icon: downloadIcon, href: "/omes/metallomics/downloads" },
    ],
};
