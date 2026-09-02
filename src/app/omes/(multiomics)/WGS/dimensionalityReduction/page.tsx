import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { query } from "@/common/apollo/client";
import PCASkeleton from "./PCASkeleton";
import { GET_WGS_PCA } from "./queries";
import { PC_COUNT, type MohdRow, type PCAData, type ReferenceRow } from "./types";
import WGSPCAPlots from "./WGSPCAPlots";

/**
 * 10-year age band, top-coded at 80+.
 *
 * Raw age is identifying: at 10-year granularity the oldest participant is alone
 * in a 90-99 band, and would show up as the only point of its color on the plot.
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
 * Coordinate precision, in decimal places.
 *
 * The API returns roughly six significant figures, far more than the plot can
 * draw. The tightest axis (PC1) spans 0.047 across a 409px data area, so one
 * pixel is 1.1e-4 and a 1e-5 step falls well inside it - the rendered plot is
 * pixel-identical until about 11x zoom. Rounding here takes ~71KB off the
 * gzipped page, a third of its total weight, and costs 26 of the 3,400
 * reference samples a coordinate they shared with a neighbour anyway.
 */
const PC_DECIMALS = 5;

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

  // Keyed by pc rather than taken in order, so the array stays indexed by PC
  // number - a reordered or missing row from the API can't shift the rest.
  const pveByPc = new Map((data?.wgs_pca_variance ?? []).map((v) => [v.pc, v.pve]));
  const pve = Array.from({ length: PC_COUNT }, (_, i) => pveByPc.get(i + 1) ?? null);

  const rows = data?.wgs_pca ?? [];
  const reference: ReferenceRow[] = [];
  const mohd: MohdRow[] = [];

  for (const row of rows) {
    // The API returns pc1..pc10 as separate fields; an array indexes far more
    // cleanly against the axis selects on the client. Rounded on the way in so
    // the trimmed values are what gets cached and serialised - see PC_DECIMALS.
    const pcs = Array.from({ length: PC_COUNT }, (_, i) =>
      Number((row[`pc${i + 1}` as keyof typeof row] as number).toFixed(PC_DECIMALS)),
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

  return { reference, mohd, pve };
};

const WGSDimensionalityReduction = () => {
  return (
    <Suspense fallback={<PCASkeleton />}>
      <WGSPCASection />
    </Suspense>
  );
};

/** The await lives here so only this subtree sits behind the Suspense boundary. */
const WGSPCASection = async () => {
  const { reference, mohd, pve } = await getPCAData();
  return <WGSPCAPlots reference={reference} mohd={mohd} pve={pve} />;
};

export default WGSDimensionalityReduction;
