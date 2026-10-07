import type { Theme } from "@mui/material/styles";
import { workSans } from "@/app/fonts";
import type { ColorbarLabelStyle } from "@/common/legends";

/** A typography length in pixels: rem against the root size, em against the font's own. */
const toPx = (length: string | number | undefined, rem: number, em: number) => {
  if (typeof length === "number") return length;
  const value = parseFloat(length ?? "0");
  if (length?.endsWith("rem")) return value * rem;
  if (length?.endsWith("em")) return value * em;
  return value;
};

/**
 * The theme's caption, for a colorbar's SVG end labels, so they read as the text around them. The
 * family is the loaded font's own name rather than the theme's CSS variable, which neither the canvas
 * measuring the labels nor a downloaded SVG can resolve; elsewhere it falls back to sans-serif.
 */
export const captionLabelStyle = ({ typography, palette }: Theme): ColorbarLabelStyle => {
  const { caption, htmlFontSize } = typography;
  const fontSize = toPx(caption.fontSize, htmlFontSize, 16);
  return {
    fontFamily: `${workSans.style.fontFamily}, sans-serif`,
    fontSize,
    fontWeight: Number(caption.fontWeight ?? 400),
    letterSpacing: toPx(caption.letterSpacing, htmlFontSize, fontSize),
    fill: palette.text.primary,
  };
};
