import { gql } from "@/common/types/generated/gql";
import { FetchExposomicsDataQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

const GET_EXPOSOMICS_DATA = gql(`
query fetchExposomicsData {
  exposomics_molecules {
    position
    molecule_list
    molecule_name
    precursor_mz
    precursor_ion_type
    smiles
    formula
    inchikey
    num_detected_samples
  }
  exposomics_quantification {
    sample_id
    site
    status
    sex
    quant_values
  }
}
 `);

export type ExposomicsMoleculeValue = {
  position: number;
  molecule_name: string;
  molecule_list: string;
  precursor_mz: number | null;
  precursor_ion_type: string;
  smiles: string;
  formula: string;
  inchikey: string;
  num_detected_samples: number | null;
  value: number | null;
};

export type ExposomicsSample = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  quantification: ExposomicsMoleculeValue[];
};

export type UseExposomicsDataParams = {
  skip?: boolean
};

export type UseExposomicsDataReturn = {
  data: ExposomicsSample[] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
};

export const useExposomicsData = ({ skip }: UseExposomicsDataParams): UseExposomicsDataReturn => {
  const { data, loading, error } = useQuery(GET_EXPOSOMICS_DATA, {
    skip: skip,
  });

  const molecules = useMemo(
    () => [...(data?.exposomics_molecules ?? [])].sort((a, b) => a.position - b.position),
    [data]
  );

  const samples: ExposomicsSample[] | undefined = useMemo(() => {
    if (!data?.exposomics_quantification) return undefined;

    return data.exposomics_quantification
      .filter((row): row is NonNullable<FetchExposomicsDataQuery["exposomics_quantification"][number]> => row !== null)
      .map((row) => ({
        sample_id: row.sample_id,
        site: row.site ?? "",
        status: row.status ?? "",
        sex: row.sex ?? "",
        quantification: molecules.map((molecule, index) => ({
          position: molecule.position,
          molecule_name: molecule.molecule_name ?? "",
          molecule_list: molecule.molecule_list ?? "",
          precursor_mz: molecule.precursor_mz ?? null,
          precursor_ion_type: molecule.precursor_ion_type ?? "",
          smiles: molecule.smiles ?? "",
          formula: molecule.formula ?? "",
          inchikey: molecule.inchikey ?? "",
          num_detected_samples: molecule.num_detected_samples ?? null,
          value: row.quant_values?.[index] ?? null,
        })),
      }));
  }, [data, molecules]);

  return {
    data: samples,
    loading,
    error,
  };
};
