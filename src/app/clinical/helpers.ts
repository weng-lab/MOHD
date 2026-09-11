import { PhenotypicalVariable } from "@/common/hooks/usePhenotypicalVariables";
import { TreeNode } from "./TreeSelect";

/** Variables excluded from the Data Explorer's selector (e.g. free-text/"other" fields not fit for plotting). */
export const EXCLUDED_VARIABLE_NAMES = new Set([
  "clinical_medical_history.clinical_measurements.measurement_context.height_input_units",
  "clinical_medical_history.clinical_measurements.measurement_context.height_protocol_modification_other",
  "clinical_medical_history.clinical_measurements.measurement_context.hip_measured",
  "clinical_medical_history.clinical_measurements.measurement_context.waist_measured",
  "clinical_medical_history.clinical_measurements.measurement_context.weight_input_units",
  "clinical_medical_history.clinical_measurements.measurement_context.weight_protocol_modification_other",
  "clinical_medical_history.family_history.cancer.daughter.description",
  "clinical_medical_history.family_history.cancer.father.description",
  "clinical_medical_history.family_history.cancer.grandparent.description",
  "clinical_medical_history.family_history.cancer.mother.description",
  "clinical_medical_history.family_history.cancer.sibling.description",
  "clinical_medical_history.family_history.cancer.son.description",
  "clinical_medical_history.personal_medical_history.cancer.description",
  "demographics.disability.other_description",
  "demographics.disability.other_disability",
  "demographics.employment.job_title",
  "demographics.gender_identity.additional_options_requested",
  "demographics.gender_identity.other_description",
  "demographics.gender_identity.other_gender_identity",
  "demographics.gender_identity.prefer_not_to_answer",
  "demographics.gender_identity.prefer_not_to_answer_detailed",
  "demographics.gender_identity.questioning_or_unsure",
  "demographics.health_insurance.insurance_type.other",
  "demographics.health_insurance.insurance_type.other_description",
  "demographics.sex_assigned_at_birth.other_description",
  "lifestyle_health_behaviors.diet.drinks.milk.other_type",
  "lifestyle_health_behaviors.diet.foods.cereal.additional_type",
  "lifestyle_health_behaviors.diet.foods.cereal.reported_additional_type",
  "lifestyle_health_behaviors.substance_use.drug_use.other.selected",
  "lifestyle_health_behaviors.substance_use.drug_use.other.self_description",
  "lifestyle_health_behaviors.substance_use.drug_use.other_stimulants.selected",
  "lifestyle_health_behaviors.substance_use.drug_use.prescription_opioids_nonmedical.selected",
  "lifestyle_health_behaviors.substance_use.drug_use.prescription_stimulants_nonmedical.selected",
  "lifestyle_health_behaviors.substance_use.drug_use.sedatives_sleeping_pills_nonmedical.selected",
  "lifestyle_health_behaviors.substance_use.drug_use.street_opioids.selected",
  "social_structural_determinants.experiences_with_discrimination.main_reason_other_description",
  "social_structural_determinants.housing.other_type",
]);

export function buildTree(variables: PhenotypicalVariable[]): TreeNode {
  const root: TreeNode = { label: "", fullPath: "", children: new Map(), isLeaf: false };
  for (const v of variables) {
    const segments = v.variable_name.split(".");
    let current = root;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const path = segments.slice(0, i + 1).join(".");
      if (!current.children.has(seg)) {
        current.children.set(seg, { label: seg, fullPath: path, children: new Map(), isLeaf: false });
      }
      current = current.children.get(seg)!;
    }
    current.isLeaf = true;
  }
  return root;
}

export function formatSegment(seg: string): string {
  return seg.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatVariableName(name: string): string {
  return name
    .split(".")
    .map((seg) => seg.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" › ");
}

export function ancestorsOf(value: string): string[] {
  const segs = value.split(".");
  return segs.slice(0, -1).map((_, i) => segs.slice(0, i + 1).join("."));
}

/**
 * Heading over the plot: the selected variable, or a prompt until anything is selected.
 */
export function plotHeading(var1Name: string): string {
  if (!var1Name) return "Select a variable";
  return `[${formatVariableName(var1Name)}]`;
}
