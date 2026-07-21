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
 */
export function buildBulkDownloadItems(
  selection: Selection,
  filesByDataset: FilesByDataset
): BulkDownloadDatasetItem[] {
  return [...selection.entries()]
    .map(([datasetId, filenames]) => {
      const datasetFiles = (filesByDataset.get(datasetId) ?? []).filter(
        (f): f is CatalogFile & { bulk_path: string } =>
          filenames.has(f.filename) && Boolean(f.bulk_path)
      );
      return [datasetId, datasetFiles] as const;
    })
    .filter(([, datasetFiles]) => datasetFiles.length > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([datasetId, datasetFiles]) => {
      const typeCount = new Map<string, number>();
      for (const f of datasetFiles) {
        typeCount.set(f.file_type, (typeCount.get(f.file_type) ?? 0) + 1);
      }

      const children: BulkDownloadFileItem[] = datasetFiles.map((f) => ({
        id: f.filename,
        label: typeCount.get(f.file_type)! > 1
          ? `${f.file_type} (${f.filename})`
          : f.file_type,
        path: f.bulk_path,
        size: Number(f.size ?? 0),
      }));

      return {
        id: `dataset-${datasetId}`,
        sampleId: datasetId,
        children,
      };
    });
}
