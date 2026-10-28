import { gql } from "@/common/types/generated/gql";
import { PcaOme } from "@/common/types/generated/graphql";
import { useQuery } from "@apollo/client/react";
import { PcVarianceMap } from "@/common/components/pcAxis";

const GET_PCA_VARIANCE = gql(`
query fetchPcaVariance($ome: PcaOme!) {
  pca_variance(ome: $ome) {
    pc
    pve
    protocol
  }
}
 `);

export type UsePcaVarianceReturn = {
  pve: PcVarianceMap;
  loading: boolean;
};

/**
 * Each PC's percent of variance explained. ATAC's protocols each had a PCA of their own, so there
 * `protocol` picks one, as pca_variance spells it - see ATAC_PROTOCOLS. Every other ome has one PCA,
 * under no protocol, so a PCA split up later reads as bare PCs rather than mixing the splits' numbers.
 */
export const usePcaVariance = (ome: PcaOme, protocol: string | null = null): UsePcaVarianceReturn => {
  const { data, loading } = useQuery(GET_PCA_VARIANCE, {
    variables: { ome },
  });

  const pve: PcVarianceMap = new Map(
    (data?.pca_variance ?? [])
      .filter((v) => (v.protocol ?? null) === protocol && v.pc !== null && v.pc !== undefined)
      .map((v) => [v.pc as number, v.pve])
  );

  return { pve, loading };
};
