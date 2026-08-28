import { Box, Skeleton, Typography } from "@mui/material";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { query } from "@/common/apollo/client";
import { GET_WGS_PCA } from "./queries";
import { PC_COUNT, type MohdRow, type PCAData, type ReferenceRow } from "./types";
import WGSPCAPlots from "./WGSPCAPlots";

/**
 * 10-year age band, top-coded at 80+.
 *
 * Raw age is identifying: at 10-year granularity the oldest participant is alone
 * in a 90-99 band, and would show up as the only point of its colour on the plot.
 * Folding 80-89 and above together keeps that top band at n=30, and also satisfies
 * the HIPAA Safe Harbor rule that ages over 89 be aggregated.
 */
const ageBin = (age: number | null | undefined): string | null => {
  if (age === null || age === undefined) return null;
  if (age >= 80) return "80+";
  const low = Math.floor(age / 10) * 10;
  return `${low}-${low + 9}`;
};

/**
 * Fetches and reshapes the PCA data.
 *
 * Cached: wgs_pca is identical for every visitor and only changes on a data
 * release, so one upstream query serves everyone. Bust it with
 * revalidateTag("wgs-pca") when new data lands.
 */
const getPCAData = async (): Promise<PCAData> => {
  "use cache";
  cacheLife("days");
  cacheTag("wgs-pca");

  const { data, error } = await query({ query: GET_WGS_PCA });
  if (error) throw error;

  const rows = data?.wgs_pca ?? [];
  const reference: ReferenceRow[] = [];
  const mohd: MohdRow[] = [];

  for (const row of rows) {
    // The API returns pc1..pc10 as separate fields; an array indexes far more
    // cleanly against the axis selects on the client.
    const pcs = Array.from(
      { length: PC_COUNT },
      (_, i) => row[`pc${i + 1}` as keyof typeof row] as number,
    );

    if (row.cohort === "MOHD") {
      mohd.push({
        sample_id: row.sample_id,
        pcs,
        case_status: row.case_status ?? null,
        sex_at_birth: row.sex_at_birth ?? null,
        site: row.site ?? null,
        recruited_condition: row.recruited_condition ?? null,
        reported_race_ethnicity: row.reported_race_ethnicity ?? null,
        // Binned here so raw age never enters the cache or the RSC payload.
        age_bin: ageBin(row.age),
      });
    } else {
      reference.push({
        sample_id: row.sample_id,
        pcs,
        superpop: row.superpop ?? null,
        gnomad_pop: row.gnomad_pop ?? null,
        sex: row.sex ?? null,
        project: row.project ?? null,
      });
    }
  }

  return { reference, mohd };
};

// minHeight rather than height: the app shell caps this grid row at the viewport,
// so a fixed 100% clips the stacked layout instead of letting the page grow.
const WGSDimensionalityReduction = () => {
  return (
    <Box p={3} display="flex" flexDirection="column" gap={2} minHeight="100%">
      <Typography variant="h5">Ancestry PCA</Typography>
      <Suspense fallback={<Skeleton variant="rounded" height="max(60vh, 520px)" />}>
        <WGSPCASection />
      </Suspense>
    </Box>
  );
};

/** The await lives here so only this subtree sits behind the Suspense boundary. */
const WGSPCASection = async () => {
  const { reference, mohd } = await getPCAData();
  return <WGSPCAPlots reference={reference} mohd={mohd} />;
};

export default WGSDimensionalityReduction;
