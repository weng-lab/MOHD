/**
 * Heights for content that fills an ome page, sized off the window rather than a flat 60vh: the app
 * bar and the ome header sit above it, and a fixed share of the window plus those is taller than the
 * window on a laptop - and far shorter than it on a large monitor.
 */

/** `viewport` under the app bar and the ome header, both of which stay put as the page scrolls. */
const underHeaders = (viewport: string) => `${viewport} - var(--header-height, 64px) - var(--ome-header-height, 66px)`;

const pageHeight = (viewport: string, chrome: number, min: number, above?: string) =>
  `max(calc(${underHeaders(viewport)} - ${chrome}px${above ? ` - ${above}` : ""}), ${min}px)`;

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
export const omePageHeight = (chrome: number, min: number, above?: string) => pageHeight("100vh", chrome, min, above);

/**
 * omePageHeight for content stacked on a phone, sized off the window with the browser's toolbars showing
 * (svh) rather than hidden (100vh), so the strip left to scroll the page by doesn't lose their height while
 * they're out. The two are equal on desktop.
 */
export const stackedOmePageHeight = (chrome: number, min: number) => pageHeight("100svh", chrome, min);

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
  columnHeight: stackedOmePageHeight(OME_PAGE_CHROME + STACKED_RESERVE, 460),
} as const;
