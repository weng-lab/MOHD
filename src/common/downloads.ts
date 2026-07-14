import type { CatalogFile } from "@/common/components/Downloads/types";

/**
 * The per-dataset archive bundle. It *is* the bulk download, so it is never
 * individually selectable for a bulk job (would be recursive). Value must match
 * the `file_type` the catalog emits for that row.
 */
export const BUNDLE_FILE_TYPE = "Compressed Tar File";

/**
 * Single source of truth for which files can be added to a bulk selection —
 * used by the grid checkboxes and the dataset-level "select all" actions.
 * Restricted files (AnVIL) and the per-dataset bundle are excluded.
 */
export const isFileBulkSelectable = (file: CatalogFile): boolean =>
  file.open_access && file.file_type !== BUNDLE_FILE_TYPE;

export const formatBytes = (bytes?: number): string => {
  if (!bytes) return "";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let i = 0;

  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }

  return `${value.toFixed(1)} ${units[i]}`;
};
