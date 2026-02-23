import { CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { Suspense } from "react";
import { theme } from "./theme";
import ClientAppWrapper from "@/common/components/ClientAppWrapper";
import { MenuControlProvider } from "@/common/components/Header/MenuContext";
import MuiXLicense from "@/common/components/MuiXLicense";
import { ApolloWrapper } from "@/common/apollo/apollo-wrapper";

export const metadata = {
  title: "MOHD Data Portal",
  description: "MOHD Data Portal: Multiomics for Health and Disease",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense>
          <ApolloWrapper>
            <AppRouterCacheProvider>
              <ThemeProvider theme={theme}>
                <MenuControlProvider>
                  {/* Overall wrapper set to be screen height */}
                  <ClientAppWrapper>{children}</ClientAppWrapper>
                </MenuControlProvider>
              </ThemeProvider>
            </AppRouterCacheProvider>
          </ApolloWrapper>
        </Suspense>
        <MuiXLicense />
        <CssBaseline />
      </body>
    </html>
  );
}
