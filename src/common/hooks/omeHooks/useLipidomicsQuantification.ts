import { useMemo } from "react";
import { gql } from "@/common/types/generated/gql";
import { FetchLipidomicsQuantificationQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_LIPIDOMICS_QUANTIFICATION = gql(`
query fetchLipidomicsQuantification {
  lipidomics_quantification {
    sample_id
    site
    status
    sex
    quant_values
  }
  lipidomics_molecules {
    position
    molecule_name
  }
}
 `);

export type LipidomicsMoleculeValue = {
  molecule_name: string;
  value: number | null;
};

export type LipidomicsSample = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  quantification: LipidomicsMoleculeValue[];
};

export type UseLipidomicsQuantificationParams = {
  skip?: boolean;
};

export type UseLipidomicsQuantificationReturn = {
  data: LipidomicsSample[] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

export const useLipidomicsQuantification = ({
  skip,
}: UseLipidomicsQuantificationParams): UseLipidomicsQuantificationReturn => {
  const { data, loading, error } = useQuery(GET_LIPIDOMICS_QUANTIFICATION, {
    skip: skip,
  });

  const samples = useMemo<LipidomicsSample[] | undefined>(() => {
    const molecules = [...(data?.lipidomics_molecules ?? [])].sort((a, b) => a.position - b.position);

    if (!data?.lipidomics_quantification) return undefined;

    return data.lipidomics_quantification
      .filter(
        (row): row is NonNullable<FetchLipidomicsQuantificationQuery["lipidomics_quantification"][number]> =>
          row !== null
      )
      .map((row) => ({
        sample_id: row.sample_id,
        site: row.site ?? "",
        status: row.status ?? "",
        sex: row.sex ?? "",
        quantification: molecules.map((molecule, index) => ({
          molecule_name: molecule.molecule_name,
          value: row.quant_values?.[index] ?? null,
        })),
      }));
  }, [data]);

  return {
    data: samples,
    loading,
    error,
  };
};
