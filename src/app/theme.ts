"use client";
import { createTheme } from "@mui/material/styles"; 

declare module "@mui/material/styles" {
  interface Palette {
    surface: Palette["primary"];
  }

  interface PaletteOptions {
    surface?: PaletteOptions["primary"];
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: "#003d38",
      light: "#00766c",
      dark: "#01373a",
    },
    secondary: {
      main: "#ca5702",
      light: "#e17b2e"
    },
    surface: {
      main: "#e8fffd",
      light: "#f6faf9"
    },
  },
  typography: {
    fontFamily: "var(--font-work-sans), sans-serif",
    h1: { fontFamily: "var(--font-montserrat), sans-serif" },
    h2: { fontFamily: "var(--font-montserrat), sans-serif" },
    h3: { fontFamily: "var(--font-montserrat), sans-serif" },
    h4: { fontFamily: "var(--font-montserrat), sans-serif" },
    h5: { fontFamily: "var(--font-montserrat), sans-serif" },
    h6: { fontFamily: "var(--font-montserrat), sans-serif" },
    button: { fontFamily: "var(--font-montserrat), sans-serif" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});
