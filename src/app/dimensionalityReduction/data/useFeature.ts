import { isMassSpecOme, type FeatureValues } from "../model/features";
import { OME_CAPABILITIES, type ExplorerOme } from "../model/omes";
import { useGeneExpression } from "./useGeneExpression";
import { useQuantification } from "./useQuantification";

/**
 * The feature coloring the plot: a gene from the API, or a mass-spec feature from the server's
 * slice of its matrix. The hook that doesn't apply is skipped with a null.
 */
export const useFeature = (ome: ExplorerOme, feature: string | null): FeatureValues => {
  const gene = useGeneExpression(OME_CAPABILITIES[ome].feature === "gene" ? feature : null);
  const massSpecOme = isMassSpecOme(ome) ? ome : null;
  const quantified = useQuantification(massSpecOme, massSpecOme && feature);
  return massSpecOme ? quantified : gene;
};
