import type { NextConfig } from "next";
import type { OmesDataType } from "./src/common/types/globalTypes";

/**
 * The tab each ome's page opens on. Everything outside the ome pages links to the bare /omes/{ome}
 * and lets these redirects pick the tab, so changing an ome's landing tab is a one-line change here.
 * Proteomics has no pages yet, and its redirect lands on a 404 until it does.
 */
const OME_LANDING_TABS = {
  WGS: "dimensionalityReduction",
  WGBS: "dimensionalityReduction",
  ATAC: "dimensionalityReduction",
  RNA: "dimensionalityReduction",
  proteomics: "dimensionalityReduction",
  metabolomics: "dimensionalityReduction",
  lipidomics: "dimensionalityReduction",
  exposomics: "downloads",
  metallomics: "dimensionalityReduction",
} satisfies Record<OmesDataType, string>;

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "arch.crane-tawny.ts.net",
    "arch.crane-tawny.ts.net:3000",
  ],
  reactCompiler: true,
  cacheComponents: true,
  async redirects() {
    return Object.entries(OME_LANDING_TABS).map(([ome, tab]) => ({
      source: `/omes/${ome}`,
      destination: `/omes/${ome}/${tab}`,
      // Temporary, since browsers cache a permanent redirect indefinitely and would keep opening the old tab.
      permanent: false,
    }));
  },
};

export default nextConfig;
