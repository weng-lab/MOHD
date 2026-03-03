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

export type Site = "CCH" | "CKD" | "EXP" | "MOM" | "UIC";

export type Status = "case" | "control" | "unknown";

export type Sex = "male"  | "female";

export type Protocol = "Buffy Coat" | "OPC" | "CPT";