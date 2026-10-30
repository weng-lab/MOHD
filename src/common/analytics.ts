import { track } from "@vercel/analytics";
import type { BulkDownloadFormat } from "@/common/hooks/useBulkDownloadJob";

/**
 * Vercel Web Analytics custom events, one for every data download, read back every six months or
 * so for the consortium's leadership. Download uses all 8 properties Web Analytics Plus allows an
 * event (Pro allows 2).
 *
 * The dashboard counts values; it can't sum them. So sizes and dataset counts go out as ranges,
 * and every value is a canonical string - the same download always reads the same - which keeps
 * the distinct values few enough to export and pivot.
 *
 * `schema` changes only when an existing property's encoding does, so events from before and after
 * can be told apart. Changelog:
 *   1 (2026-10-27) - first version.
 */
const SCHEMA = 1;

/** Vercel keeps no more of a value than this. */
const MAX_VALUE_LENGTH = 255;

export type DownloadMethod = "file" | "dataset_bundle" | "joined_quant" | `bulk_${BulkDownloadFormat}`;

export type DownloadEvent = {
  /** The catalog's ome key, e.g. "rna". */
  ome: string;
  method: DownloadMethod;
  /** "all", or the file types downloaded - see fileTypesOf. */
  fileTypes: string;
  bytes: number;
  datasets: number;
  /** The slice of the ome's datasets downloaded - see subsetOf. Null for one dataset's files. */
  subset: string | null;
  /** The Datasets table's search - see searchOf. */
  search: string | null;
};

export type RestrictedFileRequestEvent = {
  ome: string;
  /** The requested file's type, or null from the restricted-access banner, which names none. */
  fileType: string | null;
  search: string | null;
};

const MB = 1024 ** 2;
const GB = 1024 ** 3;

/** Upper bounds, in the binary units formatBytes shows, so a range agrees with the size the page listed. */
const SIZE_RANGES: [below: number, label: string][] = [
  [10 * MB, "<10 MB"],
  [100 * MB, "10–100 MB"],
  [GB, "100 MB–1 GB"],
  [10 * GB, "1–10 GB"],
  [100 * GB, "10–100 GB"],
];

const DATASET_RANGES: [max: number, label: string][] = [
  [1, "1"],
  [10, "2–10"],
  [100, "11–100"],
  [500, "101–500"],
];

const sizeRange = (bytes: number) => SIZE_RANGES.find(([below]) => bytes < below)?.[1] ?? "100 GB+";

const datasetRange = (count: number) => DATASET_RANGES.find(([max]) => count <= max)?.[1] ?? "500+";

const capped = (value: string | null) => value?.slice(0, MAX_VALUE_LENGTH) ?? null;

export function trackDownload({ ome, method, fileTypes, bytes, datasets, subset, search }: DownloadEvent) {
  track("Download", {
    ome,
    method,
    fileTypes: capped(fileTypes),
    size: sizeRange(bytes),
    datasets: datasetRange(datasets),
    subset: capped(subset),
    search: capped(search),
    schema: SCHEMA,
  });
}

/** A click through to AnVIL, where restricted files are requested. */
export function trackRestrictedFileRequest({ ome, fileType, search }: RestrictedFileRequestEvent) {
  track("Restricted file request", {
    ome,
    fileTypes: capped(fileType),
    search: capped(search),
    schema: SCHEMA,
  });
}
