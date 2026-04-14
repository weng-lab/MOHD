import type { InitialSelectedIdsByAssembly } from "@weng-lab/genomebrowser-ui";

export const TRACK_SELECT_SESSION_KEY = "mohd-browser-track-select";

export const DEFAULT_SELECTED_TRACK_IDS: InitialSelectedIdsByAssembly = {
  GRCh38: {
    "human-genes": ["human-genes/gencode-basic"],
  },
};
