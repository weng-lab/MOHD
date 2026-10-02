/**
 * Heights for content that fills an ome page, sized off the window rather than a flat 60vh: the app
 * bar and the ome header sit above it, and a fixed share of the window plus those is taller than the
 * window on a laptop - and far shorter than it on a large monitor.
 */

/** The window under the app bar and the ome header, both of which stay put as the page scrolls. */
const UNDER_HEADERS = "100vh - var(--header-height, 64px) - var(--ome-header-height, 66px)";

/**
 * OmeDetailsLayout's own spacing around a page, in px: its Stack's spacing above the page, and its
 * bottom margin.
 */
export const OME_PAGE_CHROME = 16 + 16;

/**
 * The window's height under the headers, less `chrome` px of spacing around the content, so the
 * content ends at the window's bottom with the page scrolled to the top. Floored at `min` px, where
 * scrolling is the better trade than a plot too short to read. `above` takes off anything else that
 * sits over the content, as a CSS length - a measured height variable, say.
 */
export const omePageHeight = (chrome: number, min: number, above?: string) =>
  `max(calc(${UNDER_HEADERS} - ${chrome}px${above ? ` - ${above}` : ""}), ${min}px)`;

/**
 * How much shorter than the window each pane is held once they stack. On a phone the table and the
 * plot each take every touch - one scrolls its rows, the other pans - so a pane the window's full
 * height would leave nothing to swipe to scroll the page past it. The strip left is what WGS leaves
 * beside its stacked cards.
 */
const STACKED_RESERVE = 96;

/** The floor on a pane's height side by side, in px. */
export const ROW_PANE_MIN = 560;

/**
 * TwoPaneLayout's pane heights on an ome page. Side by side, the table and plot end at the window's
 * bottom, as the WGS and explorer plots do. Stacked, each is a strip short of it - see
 * STACKED_RESERVE.
 */
export const TWO_PANE_HEIGHTS = {
  rowHeight: omePageHeight(OME_PAGE_CHROME, ROW_PANE_MIN),
  columnHeight: omePageHeight(OME_PAGE_CHROME + STACKED_RESERVE, 460),
} as const;
