import type { MohdSortCriterion, MohdSortFacetKey } from "./types";

export const MOHD_FOLDER_ID = "human-mohd";
export const MOHD_TRACK_SORT_SESSION_KEY = "mohd-browser-track-sort";

export const SORT_FACET_LABELS: Record<MohdSortFacetKey, string> = {
  kitId: "Kit ID",
  ome: "Ome",
  description: "Track description",
  sampleId: "Sample ID",
  site: "Site",
  trackCategory: "Track category",
  sex: "Sex",
  status: "Status",
};

export const DEFAULT_MOHD_SORT_CRITERIA: MohdSortCriterion[] = [
  { key: "kitId", direction: "asc" },
  { key: "ome", direction: "asc" },
  { key: "description", direction: "asc" },
  { key: "sampleId", direction: "asc" },
  { key: "site", direction: "asc" },
  { key: "trackCategory", direction: "asc" },
  { key: "sex", direction: "asc" },
  { key: "status", direction: "asc" },
];

export const SORT_FACET_KEYS = DEFAULT_MOHD_SORT_CRITERIA.map(
  (criterion) => criterion.key,
);

export const OME_ORDER = new Map([
  ["ATAC", 0],
  ["RNA", 1],
  ["WGBS", 2],
]);

export const ATAC_TRACK_ORDER = new Map([
  ["FDR 0.05 peaks", 0],
  ["Pseudorep peaks", 1],
  ["Fold change signal", 2],
  ["p-value signal", 3],
]);

export const RNA_TRACK_ORDER = new Map([
  ["All Signal Plus", 0],
  ["Unique Signal Plus", 1],
  ["All Signal Minus", 2],
  ["Unique Signal Minus", 3],
]);
