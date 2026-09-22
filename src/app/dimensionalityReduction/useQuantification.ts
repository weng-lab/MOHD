import { useEffect, useSyncExternalStore } from "react";
import type { FeatureSlice, FeatureStatus, FeatureValues, MassSpecOme } from "./features";

/**
 * Every feature fetched this session, by ome and name, so coming back to one recolors the plot at
 * once rather than after another round trip.
 *
 * Held outside React, and read through useSyncExternalStore rather than straight out of the Map
 * during render: React Compiler memoizes a plain read on its inputs, so a read keyed on a feature
 * that had not arrived yet would keep answering "not yet" after it had.
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

  // A failure is the one thing not kept: picking the feature again is how a reader tries again, and
  // the retry reads as loading rather than as the failure it is replacing.
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

/**
 * One feature's values across a mass-spec ome's samples, sliced out of the ome's matrix on the
 * server - see /api/quantification. Null for either argument skips the fetch, as a skipped query
 * would.
 */
export const useQuantification = (ome: MassSpecOme | null, feature: string | null): FeatureValues => {
  const key = ome !== null && feature !== null ? keyOf(ome, feature) : null;
  const entry = useSyncExternalStore(
    subscribe,
    () => (key === null ? undefined : entries.get(key)),
    // Nothing is fetched on the server, so a page rendered there with a feature in its URL shows it
    // loading, and hydrates to the same.
    () => undefined
  );

  useEffect(() => {
    if (ome !== null && feature !== null) load(ome, feature);
  }, [ome, feature]);

  const ready = entry?.status === "ready" ? entry : null;
  const status: FeatureStatus = key === null ? "idle" : (entry?.status ?? "loading");

  return { id: feature, name: ready?.name ?? null, values: ready?.values ?? null, status };
};
