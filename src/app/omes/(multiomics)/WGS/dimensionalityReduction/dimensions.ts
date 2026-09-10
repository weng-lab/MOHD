/**
 * Layout constants shared by the plots and the skeleton that stands in for them.
 *
 * They live here rather than in WGSPCAPlots so loading.tsx and page.tsx can size
 * their placeholders identically without importing the client component.
 */

/**
 * Footprint of the shared-axes cluster, so its skeleton doesn't shift on load.
 *
 * Both numbers are measured, not derived. Width is 2 (border) + 24 (px: 1.5)
 * + 16 (two gap: 1) + 82.56 ("Shared axes") + 87.41 ("X - PC1") + 89.13
 * ("Y - PC2") = 301. It therefore depends on text metrics: Work Sans has
 * proportional digits, so the two selects aren't even the same width as each
 * other, and choosing PC10 on both axes widens the cluster to 315. That is
 * harmless - the skeleton is only on screen before the first interaction, and
 * the cluster sits in the "auto" middle column of a 1fr/auto/1fr grid, so a
 * width that is off slides it sideways rather than resizing anything.
 *
 * Height is 2 (border) + 12 (py: 0.75) + 35 (the small select) = 49, and it
 * does not move with the selection. It is also what sets the header row's
 * height - the h5 title beside it measures only 32 - which is why PAGE_CHROME
 * reads it from here instead of repeating the measurement.
 */
export const AXIS_CLUSTER_SIZE = { width: 301, height: 49 } as const;

/** Vertical chrome above and below the cards at the lg breakpoint, in px. */
const PAGE_CHROME =
  16 + // the shell's Stack spacing above this page
  16 + // page padding, top
  AXIS_CLUSTER_SIZE.height + // header row: the cluster, which outmeasures the title
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
