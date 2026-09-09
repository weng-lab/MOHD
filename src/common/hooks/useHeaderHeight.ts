import { useMeasuredHeightVar } from "./useMeasuredHeightVar";

/**
 * Exposes the sticky app header's height as the --header-height CSS variable.
 * Call once near the app root (ClientAppWrapper) so it's available on every page — the header is
 * not a fixed 64px, since the maintenance banner adds to it, and sticky offsets underneath depend
 * on the real value.
 */
export const useHeaderHeight = () => useMeasuredHeightVar("header", "--header-height");
