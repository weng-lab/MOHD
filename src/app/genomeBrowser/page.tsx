"use client";

import dynamic from "next/dynamic";

const MohdGenomeBrowserPage = dynamic(() => import("./_components/MohdGenomeBrowserPage"), {
  ssr: false,
});

export default function BrowserPage() {
  return <MohdGenomeBrowserPage />;
}
