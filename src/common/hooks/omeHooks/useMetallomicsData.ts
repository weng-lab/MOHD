import { gql } from "@/common/types/generated/gql";
import { FetchMetallomicsDataQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_METALLOMICS_DATA = gql(`
query fetchMetallomicsData {
  metallomics_quantification {
    sample_id
    site
    status
    sex
    age_bin
    quant_values
  }
  metallomics_metals {
    metal
    position
  }
}
 `);

export type MetallomicsMetalValue = {
  metal: string;
  value: number | null;
};

export type MetallomicsSample = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  age_bin?: string | null;
  quantification: MetallomicsMetalValue[];
};

export type UseMetallomicsDataParams = {
  skip?: boolean;
};

export type UseMetallomicsDataReturn = {
  data: MetallomicsSample[] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

const toMetallomicsSamples = (data: FetchMetallomicsDataQuery | undefined): MetallomicsSample[] | undefined => {
  const metals = [...(data?.metallomics_metals ?? [])].sort((a, b) => a.position - b.position);

  if (!data?.metallomics_quantification) return undefined;

  return data.metallomics_quantification
    .filter((row): row is NonNullable<FetchMetallomicsDataQuery["metallomics_quantification"][number]> => row !== null)
    .map((row) => ({
      sample_id: row.sample_id,
      site: row.site ?? "",
      status: row.status ?? "",
      sex: row.sex ?? "",
      age_bin: row.age_bin,
      quantification: metals.map((metal, index) => ({
        metal: metal.metal,
        value: row.quant_values?.[index] ?? null,
      })),
    }));
};

export const useMetallomicsData = ({ skip }: UseMetallomicsDataParams): UseMetallomicsDataReturn => {
  const { data, loading, error } = useQuery(GET_METALLOMICS_DATA, {
    skip: skip,
  });

  return {
    data: toMetallomicsSamples(data),
    loading,
    error,
  };
};
