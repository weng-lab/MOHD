/** Sizes shared by the explorer and its skeleton, so the skeleton holds the page's shape while it loads. */

export const PANEL_WIDTH = 300;

/** Height under the app header, less the page's own padding (p={2}, top and bottom). */
export const VIEWPORT_HEIGHT = "calc(100vh - var(--header-height, 64px) - 32px)";

/** From md up both columns fit the viewport, so the plot stays beside its controls; the panel scrolls itself. */
export const PANEL_SX = {
  maxHeight: { md: VIEWPORT_HEIGHT },
  overflowY: { md: "auto" },
} as const;

/** Below this the page scrolls instead, keeping the plot usable on short screens. */
export const CARD_SX = {
  height: { xs: 560, md: `max(${VIEWPORT_HEIGHT}, 600px)` },
} as const;
