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

function mohdFileTrackId(sampleId: string, fileSuffix: string) {
  return qualifyMohdTrackId(`${sampleId}::${sampleId}_${fileSuffix}`);
}

/** Every track a sample has in its ome. */
function atacTrackIds(sampleId: string) {
  return [
    mohdFileTrackId(sampleId, "peaks-FDR5_GRCh38_v0.bigBed"),
    mohdFileTrackId(sampleId, "peaks-pseudorep_GRCh38_v0.bigBed"),
    mohdFileTrackId(sampleId, "signal-FC_GRCh38_v0.bigWig"),
    mohdFileTrackId(sampleId, "signal-pvalue_GRCh38_v0.bigWig"),
  ];
}

function rnaTrackIds(sampleId: string) {
  return [
    mohdFileTrackId(sampleId, "signal-plus-all_GRCh38_v0.bigWig"),
    mohdFileTrackId(sampleId, "signal-minus-all_GRCh38_v0.bigWig"),
    mohdFileTrackId(sampleId, "signal-plus-unique_GRCh38_v0.bigWig"),
    mohdFileTrackId(sampleId, "signal-minus-unique_GRCh38_v0.bigWig"),
  ];
}

function wgbsTrackIds(sampleId: string) {
  // WGBS rows are grouped per sample (one methylation track covers all context/strand files).
  return [qualifyMohdTrackId(sampleId)];
}

export const TRACK_SELECT_SESSION_KEY = sessionKey();

// Default samples shown on first load of the all-omes Genome Browser: one per ome.
export const DEFAULT_SELECTED_TRACK_IDS: readonly string[] = [
  ...GENE_TRACK_IDS,
  ...atacTrackIds("MOHD_EA100004"),
  ...rnaTrackIds("MOHD_ER100004"),
  ...wgbsTrackIds("MOHD_EB100004"),
];

// Default sample shown on first load of each ome's Genome Browser tab.
const ATAC_DEFAULT_SAMPLE_ID = "MOHD_EA100001";
const WGBS_DEFAULT_SAMPLE_ID = "MOHD_EB100001";
const RNA_DEFAULT_SAMPLE_ID = "MOHD_ER100001";

export const ATAC_TRACK_SELECT_SESSION_KEY = sessionKey("atac");

export const ATAC_DEFAULT_SELECTED_TRACK_IDS: readonly string[] = [
  ...GENE_TRACK_IDS,
  ...atacTrackIds(ATAC_DEFAULT_SAMPLE_ID),
];

export const WGBS_TRACK_SELECT_SESSION_KEY = sessionKey("wgbs");

export const WGBS_DEFAULT_SELECTED_TRACK_IDS: readonly string[] = [
  ...GENE_TRACK_IDS,
  ...wgbsTrackIds(WGBS_DEFAULT_SAMPLE_ID),
];

export const RNA_TRACK_SELECT_SESSION_KEY = sessionKey("rna");

export const RNA_DEFAULT_SELECTED_TRACK_IDS: readonly string[] = [
  ...GENE_TRACK_IDS,
  ...rnaTrackIds(RNA_DEFAULT_SAMPLE_ID),
];
