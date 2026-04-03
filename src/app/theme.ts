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
    },
    surface: {
      main: "#e8fffd",
    },
  },
  typography: {
    fontFamily: "var(--font-montserrat), sans-serif",
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
