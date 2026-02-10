"use client";
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0c184a",
      light: "#100e98",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#00063D",
      light: "#e4ebff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});
