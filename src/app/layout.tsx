import { CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { Suspense } from "react";
import { theme } from "./theme";
import ClientAppWrapper from "@/common/components/ClientAppWrapper";

export const metadata = {
  title: "MOHD Data Portal: Multiomics for Health and Disease",
  description: "MOHD Data Portal: Multiomics for Health and Disease",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              {/* Overall wrapper set to be screen height */}
              <ClientAppWrapper>{children}</ClientAppWrapper>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </Suspense>
        <CssBaseline />
      </body>
    </html>
  );
}
