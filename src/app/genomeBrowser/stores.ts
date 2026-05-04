import { createBrowserStore, createTrackStore } from "@weng-lab/genomebrowser";
import { DEFAULT_BROWSER_STATE } from "./defaultDomain";

export const useBrowserStore = createBrowserStore(DEFAULT_BROWSER_STATE)
export const useTrackStore = createTrackStore([])
