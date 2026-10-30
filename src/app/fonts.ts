import { Montserrat, Work_Sans } from "next/font/google";

/**
 * The site's fonts, loaded once here and imported wherever they're needed: the layout sets their CSS
 * variables, which the theme uses, and SVG text that must name a family outright (a colorbar's labels,
 * kept in downloads) uses `style.fontFamily`.
 */
export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});
