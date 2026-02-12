export const OhmsList = [
  "proteomics",
  "metabolomics",
  "exposomics",
  "lipidomics",
  "ATAC",
  "WGS",
  "WGBS",
  "RNA",
] as const;

export type OhmsDataType = (typeof OhmsList)[number];

export type OhmDetailsTab = {
    label: string;
    iconPath: string;
    route: string;
}