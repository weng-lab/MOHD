import { useEffect, useState } from "react";
import Config from "@/common/config.json";
import type {
  BaseSampleMetadata,
  CatalogDataset,
} from "@/common/components/Downloads/types";

// The catalog lives on the same service as the bulk-download jobs API.
const BASE_URL = Config.API.BULK_DOWNLOAD.replace(/\/+$/, "");

type CatalogState<T extends BaseSampleMetadata> = {
  datasets: CatalogDataset<T>[];
  loading: boolean;
  error: boolean;
};

type DatasetsResponse<T extends BaseSampleMetadata> = {
  datasets: CatalogDataset<T>[];
};

// What the last completed fetch resolved to, tagged with the ome it was for.
type Loaded<T extends BaseSampleMetadata> = {
  omeKey: string;
  datasets: CatalogDataset<T>[];
  error: boolean;
};

/**
 * Fetches the dataset + file catalog for an ome from the bulk-download service.
 * One request returns everything the downloads view needs — datasets with their
 * metadata flattened on and their files nested — replacing the old two-fetch
 * (GraphQL metadata + GraphQL file list) client-side merge.
 */
export function useOmeCatalog<T extends BaseSampleMetadata>(
  omeKey: string,
): CatalogState<T> {
  const [loaded, setLoaded] = useState<Loaded<T> | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${BASE_URL}/omes/${omeKey}/datasets`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DatasetsResponse<T>>;
      })
      .then((body) => {
        if (cancelled) return;
        setLoaded({ omeKey, datasets: body.datasets ?? [], error: false });
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded({ omeKey, datasets: [], error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [omeKey]);

  // Loading is derived, not stored: any time the last resolved fetch isn't for
  // the current ome (initial mount, or an in-flight ome switch) we're loading.
  // This avoids a synchronous setState inside the effect.
  const current = loaded?.omeKey === omeKey ? loaded : null;
  return {
    datasets: current?.datasets ?? [],
    loading: current === null,
    error: current?.error ?? false,
  };
}
