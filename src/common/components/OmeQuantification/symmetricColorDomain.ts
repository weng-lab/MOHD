import { ColumnDatum } from "@weng-lab/visualization";

/**
 * For signed, zero-centered values (e.g. z-scores), the color domain must be symmetric
 * around 0 rather than the heatmap's default [0, max] — otherwise negative values fall
 * outside the domain entirely.
 */
export const symmetricColorDomain = (
    heatmapData: ColumnDatum<Record<string, unknown>, Record<string, unknown>>[]
): [number, number] => {
    const maxAbsValue = heatmapData.reduce(
        (max, column) =>
            column.rows.reduce((rowMax, row) => (row.count === null ? rowMax : Math.max(rowMax, Math.abs(row.count))), max),
        0
    );
    return [-maxAbsValue, maxAbsValue];
};
