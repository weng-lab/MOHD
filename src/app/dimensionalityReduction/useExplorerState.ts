import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { forgetStaleRange, normalize, parseState, serializeState, type ExplorerState } from "./params";

/**
 * The explorer's state, read from and written to the URL.
 *
 * The URL is the only copy - nothing mirrors it in useState - so a link and the view it opens can
 * never disagree, and a hand-edited link is normalized on the way in like any other.
 */
export const useExplorerState = () => {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  // Parsed once per URL rather than on every render. Everything the explorer derives - the points,
  // the domains - sits in a memo keyed on this object among others, so a fresh one each render
  // would rebuild all of it for nothing.
  const state = useMemo(() => parseState(new URLSearchParams(search)), [search]);

  const setState = (next: ExplorerState) => {
    const search = serializeState(normalize(forgetStaleRange(state, next)));
    // The native history API rather than router.replace: Next keeps useSearchParams in step with
    // it, so a filter click stays a re-render - no server round trip, no scroll reset, and no
    // history entry per click to step back through.
    window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  };

  return [state, setState] as const;
};
