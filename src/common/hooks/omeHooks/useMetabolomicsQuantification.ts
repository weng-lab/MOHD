import { gql } from "@/common/types/generated/gql";
import { FetchMetabolomicsQuantificationQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_METABOLOMICS_QUANTIFICATION = gql(`
query fetchMetabolomicsQuantification {
  metabolomics_quantification {
    sample_id
    site
    status
    sex
    quant_values
  }
  metabolomics_compounds {
    position
    compound
    mode
  }
}
 `);

export type MetabolomicsCompoundValue = {
  compound: string;
  mode: string;
  value: number | null;
};

export type MetabolomicsSample = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  quantification: MetabolomicsCompoundValue[];
};

export type UseMetabolomicsQuantificationParams = {
  skip?: boolean;
};

export type UseMetabolomicsQuantificationReturn = {
  data: MetabolomicsSample[] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

const toMetabolomicsSamples = (
  data: FetchMetabolomicsQuantificationQuery | undefined
): MetabolomicsSample[] | undefined => {
  const compounds = [...(data?.metabolomics_compounds ?? [])].sort((a, b) => a.position - b.position);

  if (!data?.metabolomics_quantification) return undefined;

  return data.metabolomics_quantification
    .filter(
      (row): row is NonNullable<FetchMetabolomicsQuantificationQuery["metabolomics_quantification"][number]> =>
        row !== null
    )
    .map((row) => ({
      sample_id: row.sample_id,
      site: row.site ?? "",
      status: row.status ?? "",
      sex: row.sex ?? "",
      quantification: compounds.map((compound, index) => ({
        compound: compound.compound,
        mode: compound.mode,
        value: row.quant_values?.[index] ?? null,
      })),
    }));
};

export const useMetabolomicsQuantification = ({
  skip,
}: UseMetabolomicsQuantificationParams): UseMetabolomicsQuantificationReturn => {
  const { data, loading, error } = useQuery(GET_METABOLOMICS_QUANTIFICATION, {
    skip: skip,
  });

  return {
    data: toMetabolomicsSamples(data),
    loading,
    error,
  };
};
