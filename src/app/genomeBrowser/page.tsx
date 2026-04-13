"use client";

import dynamic from "next/dynamic";

const GenomeBrowser = dynamic(() => import("./genomeBrowser"), {
  ssr: false,
});

export default function GenomeBrowserPage() {
  return <GenomeBrowser />;
}
