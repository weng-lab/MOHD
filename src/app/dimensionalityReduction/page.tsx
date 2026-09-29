import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { query } from "@/common/apollo/client";
import DimensionalityReductionExplorer from "./DimensionalityReductionExplorer";
import ExplorerSkeleton from "./components/ExplorerSkeleton";
import { sortFeatures } from "./model/features";
import { isQcKit } from "@/common/sampleFields/fields";
import { OME_CAPABILITIES, PC_COUNT, type ExplorerOme } from "./model/omes";
import { GET_DIMENSIONALITY_REDUCTION } from "./data/queries";
import type { ExplorerData, ExplorerRow, OmeData } from "./model/types";

const PC_KEYS = ["pc1", "pc2", "pc3", "pc4", "pc5", "pc6", "pc7", "pc8", "pc9", "pc10"] as const;

/** The fields toOmeData reads, as loosely as any of the six metadata types hands them over. */
type MetadataRow = {
  sample_id: string;
  kit?: string | null;
  participant_id?: string | null;
  visit?: string | null;
  condition?: string | null;
  protocol?: string | null;
  site?: string | null;
  status?: string | null;
  sex?: string | null;
  age_bin?: string | null;
  tss_enrichment_score?: number | null;
  frip_score?: number | null;
  reads_mapped?: number | null;
  umap_x?: number | null;
  umap_y?: number | null;
} & Partial<Record<(typeof PC_KEYS)[number], number | null>>;

type VarianceRow = { pc?: number | null; pve?: number | null };

/** Coordinate precision, in decimal places: more than a plot can draw, and it nearly halves the payload. */
const COORDINATE_DECIMALS = 5;

const round = (value: number) => Number(value.toFixed(COORDINATE_DECIMALS));

const toOmeData = (
  ome: ExplorerOme,
  rows: readonly MetadataRow[] = [],
  variance: readonly VarianceRow[] = []
): OmeData => {
  const { metrics, umap } = OME_CAPABILITIES[ome];
  // Indexed by pc rather than row order, so a reordered or missing row can't shift the rest.
  const pveByPc = new Map(variance.map(({ pc, pve }) => [pc, pve]));

  const out: ExplorerRow[] = [];
  for (const row of rows) {
    // Some lipidomics and metabolomics samples were never placed in the PCA.
    const pcs = PC_KEYS.map((key) => row[key]);
    if (!pcs.every((pc): pc is number => typeof pc === "number")) continue;

    out.push({
      sample_id: row.sample_id,
      pcs: pcs.map(round),
      // Left out while UMAP is off, keeping the coordinates out of the payload.
      umap:
        umap && typeof row.umap_x === "number" && typeof row.umap_y === "number"
          ? [round(row.umap_x), round(row.umap_y)]
          : null,
      qc: isQcKit(row.kit),
      site: row.site ?? null,
      status: row.status ?? null,
      sex: row.sex ?? null,
      age_bin: row.age_bin ?? null,
      protocol: row.protocol ?? null,
      condition: row.condition ?? null,
      kit: row.kit ?? null,
      participant_id: row.participant_id ?? null,
      visit: row.visit ?? null,
      // Spread in, since an undefined key would still be written into the payload.
      ...(metrics && {
        metrics: {
          tss: row.tss_enrichment_score ?? null,
          frip: row.frip_score ?? null,
          reads: row.reads_mapped ?? null,
        },
      }),
    });
  }

  return { rows: out, pve: Array.from({ length: PC_COUNT }, (_, i) => pveByPc.get(i + 1) ?? null) };
};

/**
 * Fetches and reshapes every ome at once, so switching between them is instant. Cached for every
 * visitor; bust it with revalidateTag("dimensionality-reduction") when new data lands.
 */
const getExplorerData = async (): Promise<ExplorerData> => {
  "use cache";
  cacheLife("days");
  cacheTag("dimensionality-reduction");

  const { data, error } = await query({ query: GET_DIMENSIONALITY_REDUCTION });
  if (error) throw error;

  return {
    ATAC: toOmeData("ATAC", data?.atac_metadata, data?.atac_variance),
    RNA: toOmeData("RNA", data?.rna_metadata, data?.rna_variance),
    WGBS: toOmeData("WGBS", data?.wgbs_metadata, data?.wgbs_variance),
    lipidomics: {
      ...toOmeData("lipidomics", data?.lipidomics_metadata, data?.lipidomics_variance),
      features: sortFeatures(
        "lipid",
        (data?.lipidomics_molecules ?? []).map(({ molecule_name }) => ({ name: molecule_name }))
      ),
    },
    metabolomics: {
      ...toOmeData("metabolomics", data?.metabolomics_metadata, data?.metabolomics_variance),
      features: sortFeatures(
        "metabolite",
        (data?.metabolomics_compounds ?? []).map(({ compound, mode }) => ({ name: compound, detail: mode }))
      ),
    },
    metallomics: {
      ...toOmeData("metallomics", data?.metallomics_metadata, data?.metallomics_variance),
      features: sortFeatures(
        "metal",
        (data?.metallomics_metals ?? []).map(({ metal }) => ({ name: metal }))
      ),
    },
  };
};

const DimensionalityReductionPage = () => (
  <Suspense fallback={<ExplorerSkeleton />}>
    <ExplorerSection />
  </Suspense>
);

/** The await lives here so only this subtree sits behind the Suspense boundary. */
const ExplorerSection = async () => {
  const data = await getExplorerData();
  return <DimensionalityReductionExplorer data={data} />;
};

export default DimensionalityReductionPage;
