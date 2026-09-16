/**
 * Track-selection persistence.
 *
 * v1's TrackSelect owned this; v2 leaves storage access, parsing, and
 * invalid-data handling to the application.
 */

/**
 * The saved selection, filtered to IDs the current collections can still
 * resolve — TrackSelect rejects unknown IDs, and the catalog changes between
 * releases. Returns undefined when there is nothing usable to restore, which
 * leaves the page defaults in place.
 */
export function loadTrackIds(key: string, validTrackIds: ReadonlySet<string>, maxTracks: number) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return undefined;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;

    const trackIds = parsed
      .filter((id): id is string => typeof id === "string" && validTrackIds.has(id))
      .slice(0, maxTracks);

    return trackIds.length > 0 ? trackIds : undefined;
  } catch {
    // unreadable or unparseable storage — fall back to the defaults
    return undefined;
  }
}

export function saveTrackIds(key: string, trackIds: readonly string[]) {
  try {
    sessionStorage.setItem(key, JSON.stringify(trackIds));
  } catch {
    // storage unavailable — fail silently
  }
}
