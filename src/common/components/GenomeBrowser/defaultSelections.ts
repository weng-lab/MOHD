import type { InitialSelectedIdsByAssembly } from "@weng-lab/genomebrowser-ui";

const GENE_TRACK_IDS = ["human-genes/gencode-basic"];

export const TRACK_SELECT_SESSION_KEY = "mohd-browser-track-select";

export const DEFAULT_SELECTED_TRACK_IDS: InitialSelectedIdsByAssembly = {
  GRCh38: {
    "human-genes": GENE_TRACK_IDS,
  },
};

// Default sample shown on first load of each ome's Genome Browser tab.
const ATAC_DEFAULT_SAMPLE_ID = "MOHD_EA100001";
const WGBS_DEFAULT_SAMPLE_ID = "MOHD_EB100001";
const RNA_DEFAULT_SAMPLE_ID = "MOHD_ER100001";

export const ATAC_TRACK_SELECT_SESSION_KEY = "mohd-browser-track-select-atac";

export const ATAC_DEFAULT_SELECTED_TRACK_IDS: InitialSelectedIdsByAssembly = {
  GRCh38: {
    "human-genes": GENE_TRACK_IDS,
    "human-mohd": [
      `human-mohd/${ATAC_DEFAULT_SAMPLE_ID}::${ATAC_DEFAULT_SAMPLE_ID}_peaks-FDR5_GRCh38_v0.bigBed`,
      `human-mohd/${ATAC_DEFAULT_SAMPLE_ID}::${ATAC_DEFAULT_SAMPLE_ID}_peaks-pseudorep_GRCh38_v0.bigBed`,
      `human-mohd/${ATAC_DEFAULT_SAMPLE_ID}::${ATAC_DEFAULT_SAMPLE_ID}_signal-FC_GRCh38_v0.bigWig`,
      `human-mohd/${ATAC_DEFAULT_SAMPLE_ID}::${ATAC_DEFAULT_SAMPLE_ID}_signal-pvalue_GRCh38_v0.bigWig`,
    ],
  },
};

export const WGBS_TRACK_SELECT_SESSION_KEY = "mohd-browser-track-select-wgbs";

export const WGBS_DEFAULT_SELECTED_TRACK_IDS: InitialSelectedIdsByAssembly = {
  GRCh38: {
    "human-genes": GENE_TRACK_IDS,
    // WGBS rows are grouped per sample (one methylation track covers all context/strand files).
    "human-mohd": [`human-mohd/${WGBS_DEFAULT_SAMPLE_ID}`],
  },
};

export const RNA_TRACK_SELECT_SESSION_KEY = "mohd-browser-track-select-rna";

export const RNA_DEFAULT_SELECTED_TRACK_IDS: InitialSelectedIdsByAssembly = {
  GRCh38: {
    "human-genes": GENE_TRACK_IDS,
    "human-mohd": [
      `human-mohd/${RNA_DEFAULT_SAMPLE_ID}::${RNA_DEFAULT_SAMPLE_ID}_signal-plus-all_GRCh38_v0.bigWig`,
      `human-mohd/${RNA_DEFAULT_SAMPLE_ID}::${RNA_DEFAULT_SAMPLE_ID}_signal-minus-all_GRCh38_v0.bigWig`,
      `human-mohd/${RNA_DEFAULT_SAMPLE_ID}::${RNA_DEFAULT_SAMPLE_ID}_signal-plus-unique_GRCh38_v0.bigWig`,
      `human-mohd/${RNA_DEFAULT_SAMPLE_ID}::${RNA_DEFAULT_SAMPLE_ID}_signal-minus-unique_GRCh38_v0.bigWig`,
    ],
  },
};
