/**
 * Layout constants shared by the plots and the skeleton that stands in for them.
 *
 * They live here rather than in WGSPCAPlots so loading.tsx and page.tsx can size
 * their placeholders identically without importing the client component.
 */

/** Vertical chrome above and below the cards at the lg breakpoint, in px. */
const PAGE_CHROME =
  16 + // the shell's Stack spacing above this page
  16 + // page padding, top
  49 + // header row: the title and the shared-axes cluster (measured)
  16 + // gap between the header row and the cards
  16 + // page padding, bottom
  16; // the shell's bottom margin

/**
 * Height of a single card.
 *
 * Sized off the viewport rather than a flat 60vh: the app bar, the ome header,
 * this page's padding and the header row all sit above the cards, and
 * max(60vh, 520px) plus that chrome is taller than a 900px window - which
 * scrolled the whole shell rather than just this page. The floor keeps the
 * plots usable on short screens, where scrolling is the right trade.
 *
 * Applied to the row when the cards sit side by side, and to each card once
 * they stack - a fixed height on the row would then have to hold both, clipping
 * the second into the footer instead of letting the page grow.
 */
export const PLOT_HEIGHT = `max(calc(100vh - 64px - var(--ome-header-height, 66px) - ${PAGE_CHROME}px), 460px)`;

/** Sizing applied to each card, and to the skeleton standing in for it. */
export const CARD_SX = {
  flex: { xs: "0 0 auto", lg: 1 },
  height: { xs: PLOT_HEIGHT, lg: "auto" },
} as const;

/** Footprint of the shared-axes cluster, so its skeleton doesn't shift on load. */
export const AXIS_CLUSTER_SIZE = { width: 301, height: 49 };
