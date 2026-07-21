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

/**
 * The bulk download service rejects archive jobs (zip/tarball) whose
 * pre-archive total exceeds this with a 413. Selections above it can still be
 * downloaded via the shell script, which pulls the files directly.
 */
export const ARCHIVE_SIZE_LIMIT_BYTES = 20 * 1024 ** 3;

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

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

/**
 * Renders a job's expiry as "expires in 21 hours (22 Jul, 3:04 PM)", or
 * "expired 21 Jul, 4:03 PM" once it is past. Phrased to follow a subject, e.g.
 * `Link ${formatExpiry(job.expiresAt)}`.
 *
 * Jobs live 24 hours, so a date on its own cannot say whether a link dies
 * tonight or tomorrow morning — the clock time is what decides whether a copied
 * command is still worth pasting. The countdown leads because it answers that
 * without arithmetic; the timestamp follows for anyone planning around it.
 *
 * `now` is injectable so the result is testable. Returns null when the
 * timestamp cannot be parsed, leaving the caller to decide on a fallback.
 */
export const formatExpiry = (
  expiresAt: string,
  now: number = Date.now(),
): string | null => {
  const expiry = Date.parse(expiresAt);
  if (Number.isNaN(expiry)) return null;

  const timestamp = new Date(expiry).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  const remaining = expiry - now;
  if (remaining <= 0) return `expired ${timestamp}`;

  const hours = Math.floor(remaining / MS_PER_HOUR);
  const minutes = Math.floor((remaining % MS_PER_HOUR) / MS_PER_MINUTE);
  const countdown =
    hours > 0
      ? `${hours} hour${hours !== 1 ? "s" : ""}`
      : minutes > 0
        ? `${minutes} minute${minutes !== 1 ? "s" : ""}`
        : "under a minute";

  return `expires in ${countdown} (${timestamp})`;
};
