import { useEffect, useSyncExternalStore } from "react";
import type { FeatureSlice, FeatureStatus, FeatureValues, MassSpecOme } from "../model/features";

/**
 * Every feature fetched this session, so returning to one is instant. Read through
 * useSyncExternalStore: React Compiler would memoize a plain Map read, and keep answering "not yet"
 * after the fetch landed.
 */
type Entry =
  { status: "ready"; name: string; values: ReadonlyMap<string, number> } | { status: "missing" } | { status: "error" };

const entries = new Map<string, Entry>();
const inFlight = new Set<string>();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const keyOf = (ome: MassSpecOme, feature: string) => JSON.stringify([ome, feature]);

const notify = () => listeners.forEach((listener) => listener());

const settle = (key: string, entry: Entry) => {
  inFlight.delete(key);
  entries.set(key, entry);
  notify();
};

const load = (ome: MassSpecOme, feature: string) => {
  const key = keyOf(ome, feature);
  if (inFlight.has(key)) return;
  const entry = entries.get(key);
  if (entry && entry.status !== "error") return;

  // A failure isn't kept: picking the feature again retries it, showing as loading.
  if (entry) {
    entries.delete(key);
    notify();
  }
  inFlight.add(key);
  fetch(`/api/quantification?${new URLSearchParams({ ome, feature })}`)
    .then(async (response) => {
      if (response.status === 404) return settle(key, { status: "missing" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const slice: FeatureSlice = await response.json();
      settle(key, { status: "ready", name: slice.name, values: new Map(slice.values) });
    })
    .catch(() => settle(key, { status: "error" }));
};

/** One feature's values across a mass-spec ome's samples, from /api/quantification. Null for either argument skips the fetch. */
export const useQuantification = (ome: MassSpecOme | null, feature: string | null): FeatureValues => {
  const key = ome !== null && feature !== null ? keyOf(ome, feature) : null;
  const entry = useSyncExternalStore(
    subscribe,
    () => (key === null ? undefined : entries.get(key)),
    // Nothing is fetched on the server: it renders loading, and hydrates to the same.
    () => undefined
  );

  // The store above is the data layer: a key already loaded or in flight isn't fetched again, and a
  // response settles only its own key, so a slow one can't race the feature picked after it. Interim,
  // until the API has a per-feature query for Apollo to serve, as it does for genes.
  // react-doctor-disable-next-line react-doctor/no-fetch-in-effect -- fetches go through load's dedupe and keyed cache
  useEffect(() => {
    if (ome !== null && feature !== null) load(ome, feature);
  }, [ome, feature]);

  const ready = entry?.status === "ready" ? entry : null;
  const status: FeatureStatus = key === null ? "idle" : (entry?.status ?? "loading");

  return { id: feature, name: ready?.name ?? null, values: ready?.values ?? null, status };
};
