export const OmesList = [
  "WGS",
  "WGBS",
  "ATAC",
  "RNA",
  "proteomics",
  "metabolomics",
  "lipidomics",
  "exposomics",
  "metallomics"
] as const;

export type OmesDataType = (typeof OmesList)[number];

export type OmeDetailsTab = {
    label: string;
    iconPath: string;
    route: string;
}