import { useMemo } from "react";
import { gql } from "@/common/types/generated/gql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_METABOLOMICS_DIMENSIONALITY_REDUCTION = gql(`
query fetchMetabolomicsDimensionalityReduction {
  metabolomics_metadata {
    sample_id
    kit
    sex
    site
    status
    age_at_enrollment
    tube
    visit
    participant_id
    condition
    pc1
    pc2
    pc3
    pc4
    pc5
    pc6
    pc7
    pc8
    pc9
    pc10
  }
}
 `);

export type MetabolomicsDimensionalityReductionSample = {
  sample_id: string;
  kit: string;
  sex: string;
  site: string;
  status: string;
  age_at_enrollment?: number | null;
  tube: string;
  visit: string;
  participant_id: string;
  condition: string;
  pc1: number | null;
  pc2: number | null;
  pc3: number | null;
  pc4: number | null;
  pc5: number | null;
  pc6: number | null;
  pc7: number | null;
  pc8: number | null;
  pc9: number | null;
  pc10: number | null;
};

export type UseMetabolomicsDimensionalityReductionParams = {
  skip?: boolean;
};

export type UseMetabolomicsDimensionalityReductionReturn = {
  data: MetabolomicsDimensionalityReductionSample[] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

export const useMetabolomicsDimensionalityReduction = ({
  skip,
}: UseMetabolomicsDimensionalityReductionParams): UseMetabolomicsDimensionalityReductionReturn => {
  const { data, loading, error } = useQuery(GET_METABOLOMICS_DIMENSIONALITY_REDUCTION, {
    skip: skip,
  });

  const samples = useMemo<MetabolomicsDimensionalityReductionSample[] | undefined>(
    () =>
      data?.metabolomics_metadata.map((row) => ({
        sample_id: row.sample_id,
        kit: row.kit ?? "",
        sex: row.sex ?? "",
        site: row.site ?? "",
        status: row.status ?? "",
        age_at_enrollment: row.age_at_enrollment,
        tube: row.tube ?? "",
        visit: row.visit ?? "",
        participant_id: row.participant_id ?? "",
        condition: row.condition ?? "",
        pc1: row.pc1 ?? null,
        pc2: row.pc2 ?? null,
        pc3: row.pc3 ?? null,
        pc4: row.pc4 ?? null,
        pc5: row.pc5 ?? null,
        pc6: row.pc6 ?? null,
        pc7: row.pc7 ?? null,
        pc8: row.pc8 ?? null,
        pc9: row.pc9 ?? null,
        pc10: row.pc10 ?? null,
      })),
    [data]
  );

  return {
    data: samples,
    loading,
    error,
  };
};
