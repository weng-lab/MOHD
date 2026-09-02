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
import { GNOMAD_POP_LABELS, SUPERPOP_COLORS, SUPERPOP_LABELS } from "./populations";
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
 * listed palette has no entry for, takes the qualitative fallback in groups.ts.
 *
 * MOHD fields reuse the maps in src/common/colors.ts, so a site or a case status
 * is the same color here as anywhere else in the app. Reference `sex` shares
 * sex_color_map with MOHD `sex_at_birth` on purpose: the two plots sit side by
 * side, so male and female have to agree across them.
 */
export const FIELD_PALETTES: Partial<Record<ColorField, Palette>> = {
  case_status: status_color_map,
  site: site_color_map,
  sex_at_birth: sex_color_map,
  sex: sex_color_map,
  superpop: SUPERPOP_COLORS,
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
