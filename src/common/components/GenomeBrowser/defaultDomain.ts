import type { Chromosome, Domain, InitialBrowserState } from "@weng-lab/genomebrowser";

export const DEFAULT_DOMAIN: Domain = {
  chromosome: "chr12" as Chromosome,
  start: 53372922,
  end: 53423700,
};

export const DEFAULT_BROWSER_STATE: InitialBrowserState = {
  domain: DEFAULT_DOMAIN,
  marginWidth: 100,
  trackWidth: 1400,
  multiplier: 3,
};
