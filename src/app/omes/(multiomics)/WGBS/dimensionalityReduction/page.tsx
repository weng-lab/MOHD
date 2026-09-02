import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { query } from "@/common/apollo/client";
import { getAgeBin } from "@/common/ageBins";
import WGBSSkeleton from "./WGBSSkeleton";
import { GET_WGBS_DATA } from "./queries";
import type { WGBSRow } from "./types";
import WGBSDimensionalityReductionClient from "./WGBSDimensionalityReductionClient";

/**
 * Fetches and reshapes the WGBS metadata.
 *
 * Cached: wgbs_metadata is identical for every visitor and only changes on a
 * data release, so one upstream query serves everyone. Bust it with
 * revalidateTag("wgbs-metadata") when new data lands.
 */
const getWGBSData = async (): Promise<WGBSRow[]> => {
  "use cache";
  cacheLife("days");
  cacheTag("wgbs-metadata");

  const { data, error } = await query({ query: GET_WGBS_DATA });
  if (error) throw error;

  const rows = data?.wgbs_metadata ?? [];

  return rows.map((row) => ({
    sample_id: row.sample_id,
    kit: row.kit,
    pca_x: row.pca_x ?? null,
    pca_y: row.pca_y ?? null,
    umap_x: row.umap_x ?? null,
    umap_y: row.umap_y ?? null,
    sex: row.sex,
    site: row.site,
    status: row.status,
    // Binned here so raw age never enters the cache or the RSC payload.
    age_bin: getAgeBin(row.age_at_enrollment),
  }));
};

const WGBSDimensionalityReduction = () => {
  return (
    <Suspense fallback={<WGBSSkeleton />}>
      <WGBSSection />
    </Suspense>
  );
};

/** The await lives here so only this subtree sits behind the Suspense boundary. */
const WGBSSection = async () => {
  const rows = await getWGBSData();
  return <WGBSDimensionalityReductionClient rows={rows} />;
};

export default WGBSDimensionalityReduction;
