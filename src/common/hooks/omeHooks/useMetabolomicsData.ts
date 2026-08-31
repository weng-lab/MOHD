import { gql } from "@/common/types/generated/gql";
import { FetchMetabolomicsDataQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

const GET_METABOLOMICS_DATA = gql(`
query fetchMetabolomicsData {
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

export type UseMetabolomicsDataParams = {
  skip?: boolean
};

export type UseMetabolomicsDataReturn = {
  data: MetabolomicsSample[] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

export const useMetabolomicsData = ({ skip }: UseMetabolomicsDataParams): UseMetabolomicsDataReturn => {
  const { data, loading, error } = useQuery(GET_METABOLOMICS_DATA, {
    skip: skip,
  });

  const compounds = useMemo(
    () => [...(data?.metabolomics_compounds ?? [])].sort((a, b) => a.position - b.position),
    [data]
  );

  const samples: MetabolomicsSample[] | undefined = useMemo(() => {
    if (!data?.metabolomics_quantification) return undefined;

    return data.metabolomics_quantification
      .filter((row): row is NonNullable<FetchMetabolomicsDataQuery["metabolomics_quantification"][number]> => row !== null)
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
  }, [data, compounds]);

  return {
    data: samples,
    loading,
    error,
  };
};
