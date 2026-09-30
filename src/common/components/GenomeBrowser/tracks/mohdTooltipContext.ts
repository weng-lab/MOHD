import { createContext } from "react";
import type { MohdTrackInfo } from "./mohd";

/**
 * The catalog, for the MOHD track tooltips (see mohdTooltips.tsx): qualified track ID -> its facts.
 *
 * The browser hands a tooltip only the track's base and config, so the catalog comes in through
 * React context instead. The browser portals its tooltips, which keeps them inside this tree.
 */
export const MohdTooltipContext = createContext<Map<string, MohdTrackInfo> | null>(null);
