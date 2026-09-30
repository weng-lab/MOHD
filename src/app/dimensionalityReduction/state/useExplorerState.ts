import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { forgetStaleRange, normalize, parseState, serializeState, type ExplorerState } from "./params";

/** The explorer's state, kept only in the URL so a link and its view can't disagree. */
export const useExplorerState = () => {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  // Once per URL: the explorer's memos are keyed on this object.
  const state = useMemo(() => parseState(new URLSearchParams(search)), [search]);

  const setState = (next: ExplorerState) => {
    const search = serializeState(normalize(forgetStaleRange(state, next)));
    // Rather than router.replace: Next keeps useSearchParams in step, with no server round trip,
    // scroll reset or history entry.
    window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  };

  return [state, setState] as const;
};
