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
  "BHRC-CCHC": "#BF3831",
  "Columbia-CKD": "#79B4F0",
  "EXPAND-Asthma": "#159875",
  "MOM-Health": "#CDA0E8",
  LEON: "#F5AB54",
  "UIC-DKD": "#31487D",
};

export const BAR_PLOT_COLORS = ["#4193d4", "#38938a", "#73338f", "#c9803f", "#cd6156"];

export const sex_color_map = { female: "#9d5ca3", male: "#62A35C", prefer_not_to_answer: "lightsteelblue" };

/**
 * Display overrides for raw values whose on-screen wording should read the same
 * everywhere in the app, regardless of which component renders them - currently
 * just the "prefer not to answer" survey code, which APIs return as
 * prefer_not_to_answer.
 */
export const VALUE_LABEL_OVERRIDES: Record<string, string> = {
  prefer_not_to_answer: "Prefer no answer",
};

export const protocol_color_map = {
  "Buffy Coat method": "#d1495b",
  "OPC method": "#00798c",
  "CPT method": "#edae49",
};
