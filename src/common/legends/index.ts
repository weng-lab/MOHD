/**
 * Legends for scatter plots and heatmaps, kept apart from the app so they can move into
 * @weng-lab/visualization as they are: nothing in this folder imports from the app (lint enforces
 * it), and the app imports only from here. What this file exports is what the library will.
 */

export { default as ChipLegend } from "./ChipLegend";
export type { ChipLegendProps, LegendGroup } from "./ChipLegend";
export { default as ShapeGlyph } from "./ShapeGlyph";
export type { ShapeGlyphProps } from "./ShapeGlyph";

export { Colorbar, InlineColorbar } from "./Colorbar";
export type { ColorbarProps, ColorbarScaleProps, InlineColorbarProps } from "./Colorbar";
export { default as ColorbarLegend } from "./ColorbarLegend";
export type { ColorbarLegendProps } from "./ColorbarLegend";
export { DEFAULT_LABEL_STYLE } from "./colorbarLabels";
export type { ColorbarLabelStyle } from "./colorbarLabels";
export { default as ColorRangeButton } from "./ColorRangeButton";
export type { ColorRangeButtonProps, ColorRangeControl } from "./ColorRangeButton";
export { default as SteadyText } from "./SteadyText";
export {
  colorAt,
  evenStops,
  formatRange,
  percentile,
  percentilePresets,
  percentileRange,
  rangeAxis,
  reachOf,
  sameRange,
  sweptValues,
  symmetricPresets,
} from "./colorbarAxis";
export type { ColorRange, RampKind, RampRange, RampStop, RangePreset } from "./colorbarAxis";
