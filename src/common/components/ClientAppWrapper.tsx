"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Footer from "./Footer";
import Header from "./Header/Header";
import { DownloadJobsProvider } from "@/common/context/DownloadJobsContext";
import DownloadJobsMenu from "@/common/components/Downloads/DownloadJobsMenu";
import { useHeaderHeight } from "@/common/hooks/useHeaderHeight";

/**
 * Probes the GraphQL API with the cheapest query it answers. Resolves false when
 * the API is unreachable or answering with errors, which is what puts the header
 * into maintenance mode. Kept at module scope so the request never sits inside
 * the effect body.
 */
async function probeApiHealth(signal: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch("/api/screen-graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ __typename }" }),
      signal,
    });

    if (!res.ok) return false;
    const json = await res.json();
    return !json.errors && !!json.data;
  } catch (err) {
    // An abort is this component unmounting, not the API being down.
    if (signal.aborted) return true;
    console.error("API unreachable:", err);
    return false;
  }
}

export default function ClientAppWrapper({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState(false);

  // Keeps --header-height accurate on every page. The header is not a fixed 64px — the
  // maintenance banner below adds to it — and the ome pages' sticky offsets measure from it.
  useHeaderHeight();

  // One-shot health probe with AbortController cleanup, which is the documented
  // exception to no-fetch-in-effect: this is a single liveness check, not view
  // data, and the app has no REST data-fetching layer to route it through.
  // react-doctor-disable-next-line react-doctor/no-fetch-in-effect
  useEffect(() => {
    // Aborting on unmount keeps a slow probe from resolving onto a gone
    // component, and keeps a remount (Strict Mode's double-effect) from racing
    // its own first request.
    const controller = new AbortController();
    void probeApiHealth(controller.signal).then((healthy) => {
      if (!controller.signal.aborted) setMaintenance(!healthy);
    });
    return () => controller.abort();
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
