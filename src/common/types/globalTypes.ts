export const OmesList = [
  "proteomics",
  "metabolomics",
  "exposomics",
  "lipidomics",
  "ATAC",
  "WGS",
  "WGBS",
  "RNA",
] as const;

export type OmesDataType = (typeof OmesList)[number];

export type OmeDetailsTab = {
    label: string;
    iconPath: string;
    route: string;
}