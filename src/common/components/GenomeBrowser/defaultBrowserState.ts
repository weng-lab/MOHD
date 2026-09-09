import { hg38 } from "@weng-lab/genomebrowser";
import type { BrowserStoreInput, GenomicRegion } from "@weng-lab/genomebrowser";

export const DEFAULT_REGION: GenomicRegion = {
  chromosome: "chr12",
  start: 53372922,
  end: 53423700,
};

export const DEFAULT_BROWSER_STATE: BrowserStoreInput = {
  assembly: hg38,
  region: DEFAULT_REGION,
  marginWidth: 100,
  trackWidth: 1400,
};
