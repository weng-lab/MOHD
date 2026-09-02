import { useMeasuredHeightVar } from "./useMeasuredHeightVar";

/**
 * Exposes the ome header bar's height as the --ome-header-height CSS variable.
 * Call where #ome-header renders (OmeDetailsLayout); the element only exists on ome pages,
 * which is why this is measured here rather than at the app root.
 */
export const useOmeHeaderHeight = () => useMeasuredHeightVar("#ome-header", "--ome-header-height");
