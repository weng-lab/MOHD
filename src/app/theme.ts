"use client";
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#0F766E",
      light: "#a4dbc9",
      dark: "#115E59",
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
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

//2nd try
// primary: {
//       main: "#13735a",
//       light: "#9fc2b5",
//       dark: "#16624d",
//     },

//OG
// primary: {
//       main: "#0F766E",
//       light: "#a4dbc9",
//       dark: "#115E59",
//     },

//3rd try
// primary: {
//       main: "#1e7e59",
//       light: "#6bb391",
//       dark: "#1c533c",
//     },

//4th try
// primary: {
//       main: "#145f58",
//       light: "#5d8a84",
//       dark: "#16443f",
//     },
