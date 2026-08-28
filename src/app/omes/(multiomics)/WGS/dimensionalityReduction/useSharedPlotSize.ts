"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export type PlotSize = { width: number; height: number };

/**
 * Measures both plot containers and returns one size for both.
 *
 * Two reasons this isn't left to the plots themselves:
 *
 * ScatterPlot measures its own parent, but only settles on whatever that parent
 * happened to be during the first layout pass - inside a flex column in a card
 * that resolves its height a beat later, that reads short and never corrects,
 * so the plot renders smaller than the space it was given and stays that way
 * through window resizes.
 *
 * The plots also share one zoom through ScatterPlotSync, whose transform is in
 * pixels: the library requires both plots be the same size, and the legends
 * above them wrap to different numbers of rows, so their containers aren't. The
 * smaller of the two governs, which keeps the two views aligned.
 */
export const useSharedPlotSize = (
  a: RefObject<HTMLElement | null>,
  b: RefObject<HTMLElement | null>,
): PlotSize | undefined => {
  const [size, setSize] = useState<PlotSize>();
  // Kept in a ref so the effect can bail on an unchanged size without listing
  // the current size as a dependency and re-subscribing on every measurement.
  const latest = useRef<PlotSize>(undefined);

  useEffect(() => {
    const elements = [a.current, b.current].filter((el) => el !== null);
    if (elements.length === 0) return;

    const measure = () => {
      const width = Math.min(...elements.map((el) => el.clientWidth));
      const height = Math.min(...elements.map((el) => el.clientHeight));
      if (width <= 0 || height <= 0) return;
      if (latest.current?.width === width && latest.current?.height === height) return;
      latest.current = { width, height };
      setSize(latest.current);
    };

    measure();
    const observer = new ResizeObserver(measure);
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [a, b]);

  return size;
};
