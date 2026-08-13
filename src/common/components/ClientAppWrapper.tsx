"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Footer from "./Footer";
import Header from "./Header/Header";
import { DownloadJobsProvider } from "@/common/context/DownloadJobsContext";
import DownloadJobsMenu from "@/common/components/Downloads/DownloadJobsMenu";

export default function ClientAppWrapper({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    const checkAPIHealth = async () => {
      try {
        const res = await fetch("/api/screen-graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: "{ __typename }" }),
        });

        if (!res.ok) throw new Error("API down");
        const json = await res.json();
        if (json.errors || !json.data) throw new Error("API returned errors");
      } catch (err) {
        console.error("API unreachable:", err);
        setMaintenance(true);
      }
    };
    checkAPIHealth();
  }, []);

  return (
    <DownloadJobsProvider>
      <Box display={"flex"} flexDirection={"column"}>
        {/* Header + content alone fill at least the viewport, so the footer starts below the fold and stays hidden until the user scrolls */}
        <Box id="app-wrapper" display={"grid"} gridTemplateRows={"auto minmax(0, 1fr)"} minHeight={"100vh"}>
          <Header maintenance={maintenance} />
          {/* Wrap children to enure they will all be slotted together into the 1fr row if child is a fragment */}
          <div id="main-content-wrapper">{children}</div>
        </Box>
        <Footer />
      </Box>
      <DownloadJobsMenu />
    </DownloadJobsProvider>
  );
}
