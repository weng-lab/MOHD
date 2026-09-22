import { isMassSpecOme, type FeatureValues } from "./features";
import { OME_CAPABILITIES, type ExplorerOme } from "./omes";
import { useGeneExpression } from "./useGeneExpression";
import { useQuantification } from "./useQuantification";

/**
 * The feature coloring the plot, fetched from wherever this ome's features come from: a gene from
 * the API a gene at a time, a mass-spec feature from the server's slice of its matrix. Both hooks
 * are always called, as hooks must be, and the one that does not apply is skipped with a null.
 * Null for `feature` skips both.
 */
export const useFeature = (ome: ExplorerOme, feature: string | null): FeatureValues => {
  const gene = useGeneExpression(OME_CAPABILITIES[ome].feature === "gene" ? feature : null);
  const massSpecOme = isMassSpecOme(ome) ? ome : null;
  const quantified = useQuantification(massSpecOme, massSpecOme && feature);
  return massSpecOme ? quantified : gene;
};
