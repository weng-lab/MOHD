export type MohdSortFacetKey =
  | "kitId"
  | "ome"
  | "description"
  | "sampleId"
  | "site"
  | "trackCategory"
  | "sex"
  | "status";

export type MohdSortDirection = "asc" | "desc";

export type MohdSortCriterion = {
  key: MohdSortFacetKey;
  direction: MohdSortDirection;
};
