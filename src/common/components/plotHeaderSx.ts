/** The strip's look, for a header laid out its own way - see ExplorerPlot. */
export const PLOT_HEADER_SX = {
  bgcolor: "surface.light",
  borderBottom: 1,
  borderColor: "divider",
  flexShrink: 0,
} as const;

/** For a select in the strip: white against the shading, and capped at its width so a long value truncates on a phone. */
export const HEADER_SELECT_SX = { minWidth: 130, maxWidth: "100%", bgcolor: "background.paper" } as const;
