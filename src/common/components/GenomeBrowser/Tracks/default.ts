import {
  DisplayMode,
  Track,
  TrackType,
  TranscriptConfig,
} from "@weng-lab/genomebrowser";

export const defaultTranscript: Omit<
  TranscriptConfig,
  "id" | "assembly" | "version"
> = {
  title: "GENCODE Genes",
  trackType: TrackType.Transcript,
  displayMode: DisplayMode.Squish,
  height: 100,
  color: "#0c184a", // screen theme default
  canonicalColor: "#615fcf", // screen theme light
  highlightColor: "#3c69e8", // bright blue
  titleSize: 12,
};

export const transcriptTrack: Track = {
  ...defaultTranscript,
  color: "#0c184a",
  id: "human-genes-ignore",
  assembly: "GRCh38",
  version: 40,
};
