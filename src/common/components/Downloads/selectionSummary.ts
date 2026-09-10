import type { CatalogFile } from "@/common/components/Downloads/types";

/**
 * Pure derivations of the current bulk selection. Selection is a
 * `Map<sample_id, Set<filename>>`; these turn it into the shapes the download
 * chip, modal, and job submission consume. No React here.
 */

export type BulkDownloadFileItem = {
  id: string;
  label: string;
  path: string;
  size: number;
};

export type BulkDownloadDatasetItem = {
  id: string;
  sampleId: string;
  children: BulkDownloadFileItem[];
};

type Selection = ReadonlyMap<string, ReadonlySet<string>>;
type FilesByDataset = ReadonlyMap<string, CatalogFile[]>;

/**
 * The archiver-relative `bulk_path`s for the selection, skipping anything
 * without one (restricted files never carry a bulk_path).
 */
export function collectFilePaths(selection: Selection, filesByDataset: FilesByDataset): string[] {
  const paths: string[] = [];
  for (const [datasetId, filenames] of selection) {
    const datasetFiles = filesByDataset.get(datasetId);
    if (!datasetFiles) continue;
    for (const file of datasetFiles) {
      if (filenames.has(file.filename) && file.bulk_path) {
        paths.push(file.bulk_path);
      }
    }
  }
  return paths;
}

/** Total size in bytes across every selected file. */
export function totalSelectedSize(selection: Selection, filesByDataset: FilesByDataset): number {
  let sum = 0;
  for (const [datasetId, filenames] of selection) {
    const datasetFiles = filesByDataset.get(datasetId);
    if (!datasetFiles) continue;
    for (const file of datasetFiles) {
      if (filenames.has(file.filename)) sum += Number(file.size ?? 0);
    }
  }
  return sum;
}

/**
 * Group the selection into the per-dataset tree the download modal renders.
 * Skips anything without a `bulk_path` on the same rule as `collectFilePaths`,
 * so what the modal lists is exactly what a job would download.
 *
 * Per-dataset results are cached by identity (see `itemCache`) so that a large
 * selection changing by one file produces one new dataset object, not N.
 */
export function buildBulkDownloadItems(
  selection: Selection,
  filesByDataset: FilesByDataset
): BulkDownloadDatasetItem[] {
  const items: BulkDownloadDatasetItem[] = [];
  for (const [datasetId, filenames] of selection) {
    const datasetFiles = filesByDataset.get(datasetId);
    if (!datasetFiles) continue;
    const item = cachedDatasetItem(datasetId, datasetFiles, filenames);
    if (item) items.push(item);
  }
  return items.sort((a, b) => a.sampleId.localeCompare(b.sampleId));
}

/**
 * dataset file list -> selected filenames -> the built item (or null when the
 * dataset contributes nothing downloadable).
 *
 * Both keys are replaced only for the dataset that actually changed: the
 * catalog hands back one stable `files` array per dataset, and the selection
 * reducers copy the outer Map but reuse the inner Set for every dataset a
 * change didn't touch. So an untouched dataset hits the cache and keeps its
 * object identity, which is what lets the review list's rows skip re-rendering.
 * Weak on both levels, so entries go when a catalog refetch or a deselect drops
 * the last reference to their keys.
 */
const itemCache = new WeakMap<CatalogFile[], WeakMap<ReadonlySet<string>, BulkDownloadDatasetItem | null>>();

function cachedDatasetItem(
  datasetId: string,
  datasetFiles: CatalogFile[],
  filenames: ReadonlySet<string>
): BulkDownloadDatasetItem | null {
  let bySelection = itemCache.get(datasetFiles);
  if (!bySelection) {
    bySelection = new WeakMap();
    itemCache.set(datasetFiles, bySelection);
  }
  if (bySelection.has(filenames)) return bySelection.get(filenames)!;

  const item = buildDatasetItem(datasetId, datasetFiles, filenames);
  bySelection.set(filenames, item);
  return item;
}

function buildDatasetItem(
  datasetId: string,
  datasetFiles: CatalogFile[],
  filenames: ReadonlySet<string>
): BulkDownloadDatasetItem | null {
  const selected = datasetFiles.filter(
    (f): f is CatalogFile & { bulk_path: string } => filenames.has(f.filename) && Boolean(f.bulk_path)
  );
  if (selected.length === 0) return null;

  const typeCount = new Map<string, number>();
  for (const f of selected) {
    typeCount.set(f.file_type, (typeCount.get(f.file_type) ?? 0) + 1);
  }

  const children: BulkDownloadFileItem[] = selected.map((f) => ({
    id: f.filename,
    label: typeCount.get(f.file_type)! > 1 ? `${f.file_type} (${f.filename})` : f.file_type,
    path: f.bulk_path,
    size: Number(f.size ?? 0),
  }));

  return {
    id: `dataset-${datasetId}`,
    sampleId: datasetId,
    children,
  };
}
