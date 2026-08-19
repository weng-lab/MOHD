/**
 * age_at_enrollment is sensitive. Raw values must never be rendered in the UI -
 * always resolve through getAgeBin() first, which collapses age into wide,
 * fixed-width ranges (top-coded at 90+, matching the HIPAA Safe Harbor
 * de-identification standard for ages) so no individual age is ever displayed.
 */

const AGE_BIN_EDGES = [20, 30, 40, 50, 60, 70, 80, 90];

const AGE_BIN_LABELS = [
  `<${AGE_BIN_EDGES[0]}`,
  ...AGE_BIN_EDGES.slice(0, -1).map((edge, i) => `${edge}–${AGE_BIN_EDGES[i + 1] - 1}`),
  `${AGE_BIN_EDGES[AGE_BIN_EDGES.length - 1]}+`,
];

export const AGE_UNKNOWN_LABEL = "unknown";

export const AGE_BIN_ORDER = [...AGE_BIN_LABELS, AGE_UNKNOWN_LABEL];

export function getAgeBin(age: number | null | undefined): string {
  if (age === null || age === undefined || Number.isNaN(age)) return AGE_UNKNOWN_LABEL;
  const index = AGE_BIN_EDGES.findIndex((edge) => age < edge);
  return index === -1 ? AGE_BIN_LABELS[AGE_BIN_LABELS.length - 1] : AGE_BIN_LABELS[index];
}

// Single-hue, monotone-lightness ordinal ramp (light -> dark, young -> old).
const AGE_BIN_RAMP = [
  "#cde2fb",
  "#b7d3f6",
  "#9ec5f4",
  "#86b6ef",
  "#6da7ec",
  "#3987e5",
  "#256abf",
  "#184f95",
  "#0d366b",
];

export const age_bin_color_map: Record<string, string> = {
  ...Object.fromEntries(AGE_BIN_LABELS.map((label, i) => [label, AGE_BIN_RAMP[i]])),
  [AGE_UNKNOWN_LABEL]: "#CCCCCC",
};
