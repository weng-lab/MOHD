import type { Theme } from "@mui/material/styles";
import { themeLabelStyle } from "@weng-lab/visualization";
import { workSans } from "@/app/fonts";

/**
 * The theme's caption, for a colorbar's SVG end labels, so they read as the text around them. The
 * family is the loaded font's own name rather than the theme's CSS variable, which neither the canvas
 * measuring the labels nor a downloaded SVG can resolve; elsewhere it falls back to sans-serif.
 */
export const captionLabelStyle = (theme: Theme) => themeLabelStyle(theme, `${workSans.style.fontFamily}, sans-serif`);
