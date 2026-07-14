import { useCallback, useRef, useState, type PointerEvent } from "react";

/**
 * Drag-to-resize state for the split-pane layout. Returns the current left-pane
 * width (as a percentage), the container ref used to measure drag position, and
 * the pointer handlers to spread onto the divider.
 */
export function useResizablePanes(initialPct = 60, min = 15, max = 85) {
  const [leftPct, setLeftPct] = useState(initialPct);
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newPct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(max, Math.max(min, newPct)));
    },
    [min, max]
  );

  const onPointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  return {
    leftPct,
    containerRef,
    dividerHandlers: { onPointerDown, onPointerMove, onPointerUp },
  };
}
