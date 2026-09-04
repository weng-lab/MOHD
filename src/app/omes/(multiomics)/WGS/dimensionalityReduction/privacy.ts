/**
 * Small-cell suppression for MOHD's reported race/ethnicity.
 *
 * At this release - roughly half the eventual WGS cohort - the field has
 * categories of one and of four participants. A category that small is
 * identifying on its own: a lone point in its own color, named on the legend and
 * again in its tooltip, publishes a participant's self-reported race beside their
 * genotype coordinates.
 *
 * Small categories are therefore folded into one bin before the data leaves the
 * server, for the same reason and in the same place as ageBin() - the raw
 * category has to stay out of the cache and the RSC payload, not just off the
 * legend. Binning on the client would leave it in both, and in the point tooltip.
 *
 * The folded labels ride along as a plain list, so the legend can still show the
 * survey's response set with no count attached to any one of them.
 *
 * The bin itself is not held to MIN_GROUP_SIZE, and deliberately: on this release
 * it holds five participants across two categories, and reaching ten would mean
 * dissolving the next smallest category - a standalone group of nineteen that
 * belongs on the plot on its own terms - to close a much weaker exposure.
 * Membership spread across two categories is ambiguous in a way a named group of
 * one is not.
 */
import type { MohdRow } from "./types";

/**
 * The bin's group value, standing in for the category on the row itself. It is a
 * group value like any other, so it colors, toggles and highlights like one.
 */
export const PRIVACY_BIN = "Binned for Privacy";

/** A category with fewer participants than this is folded into the bin. */
const MIN_GROUP_SIZE = 10;

/** Slate. Distinct from the qualitative palette and from "Unknown"'s light grey. */
export const PRIVACY_BIN_COLOR = "#5F6B7A";

/**
 * Rewrites small categories to PRIVACY_BIN, and reports which ones it folded in.
 *
 * Returns the rows unchanged, and no members, when nothing trips the threshold -
 * so a later release that fills every category out drops the bin from the legend
 * without a code change.
 */
export const binReportedRace = (rows: MohdRow[]): { rows: MohdRow[]; members: string[] } => {
  const counts = new Map<string, number>();

  for (const { reported_race_ethnicity: value } of rows) {
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  // Ascending, so the categories that trip the threshold are a prefix of this and
  // "the next smallest category" is just the entry after them.
  const ordered = [...counts].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
  const small = ordered.filter(([, n]) => n < MIN_GROUP_SIZE);
  if (small.length === 0) return { rows, members: [] };

  // One condition extends the bin past the categories that tripped it: a bin
  // holding a single category hides nothing, since its chip's count is that
  // category's count and its hover names it. The next smallest category comes in
  // with it - the only place a category above the threshold is folded in, and it
  // does not fire on the current release, where two categories trip it.
  //
  // Nothing extends the bin for being small overall. Every category left is at or
  // above MIN_GROUP_SIZE, so there is no small group to reach for, and padding the
  // bin with a legitimate one would cost more than the exposure it closes.
  const take = small.length === 1 && ordered.length > 1 ? 2 : small.length;
  const binned = new Set(ordered.slice(0, take).map(([value]) => value));

  return {
    rows: rows.map((row) =>
      row.reported_race_ethnicity && binned.has(row.reported_race_ethnicity)
        ? { ...row, reported_race_ethnicity: PRIVACY_BIN }
        : row,
    ),
    // Alphabetical rather than by count: the hover is a list of responses, and
    // ordering it by size would put back the ranking the binning just removed.
    members: [...binned].sort(),
  };
};
