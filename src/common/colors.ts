export const OME_COLORS: Record<string, string> = {
  atac: "#89d8e3",
  exposomics: "#f1ab9f",
  lipidomics: "#8966b4",
  metabolomics: "#ab6bba",
  proteomics: "#ffa15b",
  metallomics: "#da7bbe",
  rna: "#309b47",
  wgbs: "#62c1ca",
  wgs: "#59acd8",
};

export const status_color_map = {
  case: "#e41a1c",
  control: "#377eb8",
  unknown: "lightgray",
  "high risk": "#F5761A",
  "low risk": "#FEE12B",
};

export const site_color_map = {
  CCH: "#BF3831",
  CCHC: "#BF3831",

  CKD: "#79B4F0",
  "Columbia-CKD": "#79B4F0",

  EXP: "#159875",
  "EXPAND-Asthma": "#159875",

  MOM: "#CDA0E8",
  "MOM-Health": "#CDA0E8",

  UIC: "#31487D",
  "UIC-DKD": "#31487D",

  LEON: "#D0944E",
};

export const BAR_PLOT_COLORS = ["#4193d4", "#38938a", "#73338f", "#c9803f", "#cd6156"];

export const sex_color_map = { female: "#9d5ca3", male: "#62A35C", "prefer no answer": "lightsteelblue" };

export const protocol_color_map = {
  "Buffy Coat method": "#d1495b",
  "OPC method": "#00798c",
  "CPT method": "#edae49",
};

// Samples with no site/status/sex/protocol on record (e.g. QC blanks) are grouped as "Control" and rendered grey.
export const CONTROL_LABEL = "Control";
export const CONTROL_COLOR = "#CCCCCC";

export type CategoricalColorScheme = "sex" | "status" | "site" | "protocol";

export function getCategoricalLabel(value: string | null | undefined): string {
  return value ? value : CONTROL_LABEL;
}

export function getCategoricalColor(colorScheme: CategoricalColorScheme, label: string): string | undefined {
  if (label === CONTROL_LABEL) return CONTROL_COLOR;
  switch (colorScheme) {
    case "sex":
      return sex_color_map[label as keyof typeof sex_color_map];
    case "status":
      return status_color_map[label as keyof typeof status_color_map];
    case "site":
      return site_color_map[label as keyof typeof site_color_map];
    case "protocol":
      return protocol_color_map[label as keyof typeof protocol_color_map];
  }
}
