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

export const useMetallomicsData = ({ skip }: UseMetallomicsDataParams): UseMetallomicsDataReturn => {
  const { data, loading, error } = useQuery(GET_METALLOMICS_DATA, {
    skip: skip,
  });

  const metals = [...(data?.metallomics_metals ?? [])].sort((a, b) => a.position - b.position);

  const samples: MetallomicsSample[] | undefined = !data?.metallomics_quantification
    ? undefined
    : data.metallomics_quantification
        .filter(
          (row): row is NonNullable<FetchMetallomicsDataQuery["metallomics_quantification"][number]> => row !== null
        )
        .map((row) => ({
          sample_id: row.sample_id,
          site: row.site ?? "",
          status: row.status ?? "",
          sex: row.sex ?? "",
          quantification: metals.map((metal, index) => ({
            metal: metal.metal,
            value: row.quant_values?.[index] ?? null,
          })),
        }));

  return {
    data: samples,
    loading,
    error,
  };
};
