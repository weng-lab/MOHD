import { gql } from "@/common/types/generated/gql";
import { PcaOme } from "@/common/types/generated/graphql";
import { useQuery } from "@apollo/client/react";
import { PcVarianceMap } from "@/common/components/pcAxis";

const GET_PCA_VARIANCE = gql(`
query fetchPcaVariance($ome: PcaOme!) {
  pca_variance(ome: $ome) {
    pc
    pve
  }
}
 `);

export type UsePcaVarianceReturn = {
  pve: PcVarianceMap;
  loading: boolean;
};

export const usePcaVariance = (ome: PcaOme): UsePcaVarianceReturn => {
  const { data, loading } = useQuery(GET_PCA_VARIANCE, {
    variables: { ome },
  });

  const pve: PcVarianceMap = new Map(
    (data?.pca_variance ?? []).filter((v) => v.pc !== null && v.pc !== undefined).map((v) => [v.pc as number, v.pve])
  );

  return { pve, loading };
};
