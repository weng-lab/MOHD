import { GENCODE_BASIC_TRACK_ID, qualifyMohdTrackId } from "./tracks";

/**
 * Track IDs are the qualified `${collectionId}::${trackId}` form that
 * TrackSelect and the track store use.
 *
 * The session keys carry a version suffix: v1 persisted IDs in a different
 * format, so bumping the key discards saved selections that can no longer
 * resolve instead of silently dropping tracks.
 */
const SESSION_KEY_VERSION = "v2";

function sessionKey(suffix?: string) {
  return ["mohd-browser-track-select", suffix, SESSION_KEY_VERSION].filter(Boolean).join("-");
}

const GENE_TRACK_IDS = [GENCODE_BASIC_TRACK_ID];

export const TRACK_SELECT_SESSION_KEY = sessionKey();

export const DEFAULT_SELECTED_TRACK_IDS: readonly string[] = GENE_TRACK_IDS;

// Default sample shown on first load of each ome's Genome Browser tab.
const ATAC_DEFAULT_SAMPLE_ID = "MOHD_EA100001";
const WGBS_DEFAULT_SAMPLE_ID = "MOHD_EB100001";
const RNA_DEFAULT_SAMPLE_ID = "MOHD_ER100001";

function mohdFileTrackId(sampleId: string, fileSuffix: string) {
  return qualifyMohdTrackId(`${sampleId}::${sampleId}_${fileSuffix}`);
}

export const ATAC_TRACK_SELECT_SESSION_KEY = sessionKey("atac");

export const ATAC_DEFAULT_SELECTED_TRACK_IDS: readonly string[] = [
  ...GENE_TRACK_IDS,
  mohdFileTrackId(ATAC_DEFAULT_SAMPLE_ID, "peaks-FDR5_GRCh38_v0.bigBed"),
  mohdFileTrackId(ATAC_DEFAULT_SAMPLE_ID, "peaks-pseudorep_GRCh38_v0.bigBed"),
  mohdFileTrackId(ATAC_DEFAULT_SAMPLE_ID, "signal-FC_GRCh38_v0.bigWig"),
  mohdFileTrackId(ATAC_DEFAULT_SAMPLE_ID, "signal-pvalue_GRCh38_v0.bigWig"),
];

export const WGBS_TRACK_SELECT_SESSION_KEY = sessionKey("wgbs");

export const WGBS_DEFAULT_SELECTED_TRACK_IDS: readonly string[] = [
  ...GENE_TRACK_IDS,
  // WGBS rows are grouped per sample (one methylation track covers all context/strand files).
  qualifyMohdTrackId(WGBS_DEFAULT_SAMPLE_ID),
];

export const RNA_TRACK_SELECT_SESSION_KEY = sessionKey("rna");

export const RNA_DEFAULT_SELECTED_TRACK_IDS: readonly string[] = [
  ...GENE_TRACK_IDS,
  mohdFileTrackId(RNA_DEFAULT_SAMPLE_ID, "signal-plus-all_GRCh38_v0.bigWig"),
  mohdFileTrackId(RNA_DEFAULT_SAMPLE_ID, "signal-minus-all_GRCh38_v0.bigWig"),
  mohdFileTrackId(RNA_DEFAULT_SAMPLE_ID, "signal-plus-unique_GRCh38_v0.bigWig"),
  mohdFileTrackId(RNA_DEFAULT_SAMPLE_ID, "signal-minus-unique_GRCh38_v0.bigWig"),
];
