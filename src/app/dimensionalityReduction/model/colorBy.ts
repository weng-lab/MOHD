/** What the explorer can color by: a sample field, one of ATAC's library metrics, or a feature's quantification. */

import { fieldsFor, isField, type Field, type FieldDefinition } from "@/common/sampleFields/fields";
import { FEATURE_KINDS, isFeatureColor, type FeatureColor, type FeatureKind } from "./features";
import { METRICS, isMetric, type Metric } from "./metrics";
import { OME_CAPABILITIES, type ExplorerOme } from "./omes";

/** A field, one of ATAC's library metrics, or one feature's quantification. */
export type ColorBy = Field | Metric | FeatureColor;

export const isColorBy = (value: string | null): value is ColorBy =>
  isField(value) || isMetric(value) || isFeatureColor(value);

/** The colorings drawn on a ramp with a colorbar, rather than as groups with chips and filters. */
export const isContinuous = (color: ColorBy) => isMetric(color) || isFeatureColor(color);

export type ColorOptions = {
  fields: FieldDefinition[];
  /** Empty on an ome with no metrics. */
  metrics: readonly (typeof METRICS)[number][];
  /** The kind of feature that can color this ome, if any. */
  feature: FeatureKind | null;
};

export const colorOptionsFor = (ome: ExplorerOme): ColorOptions => ({
  fields: fieldsFor(ome),
  metrics: OME_CAPABILITIES[ome].metrics ? METRICS : [],
  feature: OME_CAPABILITIES[ome].feature,
});

/** Whether an ome offers a coloring: what a hand-edited ?color=, or one carried over from another ome, is held to. */
export const offersColor = (ome: ExplorerOme, color: ColorBy) => {
  const { fields, metrics, feature } = colorOptionsFor(ome);
  return isFeatureColor(color)
    ? feature !== null && FEATURE_KINDS[feature].color === color
    : [...fields, ...metrics].some(({ key }) => key === color);
};

/** "Site", "TSS enrichment", "Lipid abundance". The explorer names a picked feature itself. */
export const colorLabel = (ome: ExplorerOme, color: ColorBy) => {
  const { fields, metrics, feature } = colorOptionsFor(ome);
  if (isFeatureColor(color)) return feature ? FEATURE_KINDS[feature].option : "Feature";
  return [...fields, ...metrics].find(({ key }) => key === color)?.label ?? color;
};
