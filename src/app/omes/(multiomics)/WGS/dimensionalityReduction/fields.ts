/**
 * The color-by fields: which ones each cohort offers, and how each field's
 * values are colored and named.
 *
 * These three tables are keyed by the same row field names and are only ever
 * correct together - a field added to the options with no palette silently falls
 * back to the qualitative ramp, and one with no labels shows its raw codes. They
 * were in three separate files, which made adding a field a three-file edit with
 * nothing to catch a step being missed. ColorField is derived from the options
 * rather than repeated, so a mistyped key in either table below is a compile
 * error instead of a legend that just looks wrong.
 */

import { sex_color_map, site_color_map, status_color_map } from "@/common/colors";
import { GNOMAD_POP_COLORS, GNOMAD_POP_LABELS, SUPERPOP_COLORS, SUPERPOP_LABELS } from "./populations";
import type { MohdRow, ReferenceRow } from "./types";

/** A field a plot can be colored by, and the label shown in its select. */
export type ColorOption<K> = { key: K; label: string };

/**
 * `as const` so the keys survive as literals for ColorField below; `satisfies`
 * so each one still has to name a real field on its cohort's row.
 */
export const REFERENCE_COLOR_OPTIONS = [
  { key: "superpop", label: "Super Population" },
  { key: "gnomad_pop", label: "gnomAD Population" },
  { key: "sex", label: "Sex" },
  { key: "project", label: "Project" },
] as const satisfies readonly ColorOption<keyof ReferenceRow>[];

export const MOHD_COLOR_OPTIONS = [
  { key: "case_status", label: "Case Status" },
  { key: "sex_at_birth", label: "Sex at Birth" },
  { key: "site", label: "Site" },
  { key: "recruited_condition", label: "Recruited Condition" },
  { key: "reported_race_ethnicity", label: "Reported Race/Ethnicity" },
  { key: "age_bin", label: "Age" },
] as const satisfies readonly ColorOption<keyof MohdRow>[];

export type ReferenceColorField = (typeof REFERENCE_COLOR_OPTIONS)[number]["key"];
export type MohdColorField = (typeof MOHD_COLOR_OPTIONS)[number]["key"];

/**
 * Every field either cohort can be colored by.
 *
 * Narrower than `keyof ReferenceRow | keyof MohdRow`, which would also admit
 * sample_id and pcs - neither is something a plot can be colored by.
 */
export type ColorField = ReferenceColorField | MohdColorField;

/** A field's value-to-color map. Not every value has to be listed. */
export type Palette = Record<string, string | undefined>;

/**
 * The palette for each field's values. Anything not listed here, and any value a
 * listed palette has no entry for, takes its cohort's fallback pool below.
 *
 * MOHD fields reuse the maps in src/common/colors.ts, so a site or a case status
 * is the same color here as anywhere else in the app. Reference `sex` shares
 * sex_color_map with MOHD `sex_at_birth` on purpose: the two plots sit side by
 * side, so male and female have to agree across them.
 *
 * Both population fields are named here rather than left to a pool. Their values
 * are a fixed published vocabulary, so a code keeps its color no matter which
 * groups a release happens to contain - a pool hands colors out in count order,
 * which would let AFR change color as the cohort grows.
 */
export const FIELD_PALETTES: Partial<Record<ColorField, Palette>> = {
  case_status: status_color_map,
  site: site_color_map,
  sex_at_birth: sex_color_map,
  sex: sex_color_map,
  superpop: SUPERPOP_COLORS,
  gnomad_pop: GNOMAD_POP_COLORS,
};

/**
 * Readable labels for each field's values, for the fields whose values arrive as
 * codes. MOHD's come back from the API already readable, so only the reference
 * cohort's two population fields are listed.
 */
export const FIELD_LABELS: Partial<Record<ColorField, Record<string, string>>> = {
  superpop: SUPERPOP_LABELS,
  gnomad_pop: GNOMAD_POP_LABELS,
};

/**
 * The two fallback pools, for the values no palette above answers for.
 *
 * They are deliberately disjoint, and they are kept side by side here so that
 * staying disjoint is something you can check by looking. The reference plot and
 * the MOHD plot are on screen together, each with its own color-by select, so any
 * color in one pool can end up beside any color in the other. A shared pool put
 * MOHD's "Reported Race/Ethnicity" in the exact colors of the reference plot's
 * populations - the same red, the same blue, in the same order - which reads as a
 * claim that a self-reported race corresponds to a genetic population. It is not
 * one we make, and the plots should not be able to imply it.
 *
 * Nothing enforces the split at compile time. If you add to either list, keep
 * every new color at least ~15 ΔE2000 from every color in the other one, from
 * SUPERPOP_COLORS and GNOMAD_POP_COLORS, and from UNKNOWN_COLOR and
 * PRIVACY_BIN_COLOR, which share the MOHD legend.
 */

/**
 * Reference panel fallback: the super population colors themselves.
 *
 * The only field that reaches this is `project`, which has one value per source
 * cohort. It is not a population vocabulary - nobody reads an ancestry claim out
 * of "1000 Genomes" versus "HGDP" - so it can sit in the reference plot's own
 * family rather than spending scarce colors on a pool of its own. That is what
 * leaves the whole rest of the space to the MOHD pool below.
 */
export const REFERENCE_FALLBACK_COLORS: readonly string[] = Object.values(SUPERPOP_COLORS);

/**
 * MOHD fallback, for reported race/ethnicity and recruited condition.
 *
 * Set1's brights lead, because the reference plot no longer uses them: once the
 * populations moved to Figure 3's deep jewel tones, most of Set1 came free, and
 * these are the four that clear it. The rest of Set1 does not - its purple lands
 * on Middle East/North Africa, its cyan on Central/South Asia, its olive on
 * Oceania, its orange on the Americas and its blue on Africa - so the pool is
 * topped up with deeper colors chosen to clear both plots instead.
 *
 * Order matters: the cursor in groups.ts hands these out in sequence, so the
 * largest groups on the plot get the four Set1 colors and the deeper ones fall to
 * the tail, where a field has enough categories to need them.
 */
export const MOHD_FALLBACK_COLORS: readonly string[] = [
  "#E41A1C", // Set1 red
  "#4DAF4A", // Set1 green
  "#A65628", // Set1 brown
  "#F781BF", // Set1 pink
  "#256B34", // forest
  "#97862A", // dark gold
  "#7A1F1F", // oxblood
  "#1F3A6E", // navy
];

/**
 * Every key in MOHD_COLOR_OPTIONS. The two option lists share no key, so a field
 * names its cohort on its own and the pools cannot be picked the wrong way round.
 */
const MOHD_KEYS: ReadonlySet<string> = new Set(MOHD_COLOR_OPTIONS.map((option) => option.key));

/** The fallback pool a field draws from, by the cohort its plot shows. */
export const fallbackPalette = (key: ColorField): readonly string[] =>
  MOHD_KEYS.has(key) ? MOHD_FALLBACK_COLORS : REFERENCE_FALLBACK_COLORS;
