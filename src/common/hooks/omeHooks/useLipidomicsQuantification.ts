import { gql } from "@/common/types/generated/gql";
import { FetchLipidomicsQuantificationQuery } from "@/common/types/generated/graphql";
import type { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { toSample } from "@/common/sampleFields/fields";

const GET_LIPIDOMICS_QUANTIFICATION = gql(`
query fetchLipidomicsQuantification {
  lipidomics_quantification {
    sample_id
    site
    status
    sex
    age_bin
    quant_values
  }
  lipidomics_molecules {
    position
    molecule_name
  }
  lipidomics_metadata {
    sample_id
    kit
  }
}
 `);

export type LipidomicsMoleculeValue = {
  molecule_name: string;
  value: number | null;
};

export type LipidomicsSample = {
  sample_id: string;
  /** QC or reference material rather than a participant's sample - see toSample. */
  qc: boolean;
  site: string;
  status: string;
  sex: string;
  age_bin?: string | null;
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

const toLipidomicsSamples = (data: FetchLipidomicsQuantificationQuery | undefined): LipidomicsSample[] | undefined => {
  const molecules = [...(data?.lipidomics_molecules ?? [])].sort((a, b) => a.position - b.position);

  if (!data?.lipidomics_quantification) return undefined;

  // Quantification rows come without a kit, which says which samples are QC - see toSample.
  const kitOf = new Map(data.lipidomics_metadata.map(({ sample_id, kit }) => [sample_id, kit]));

  return data.lipidomics_quantification
    .filter(
      (row): row is NonNullable<FetchLipidomicsQuantificationQuery["lipidomics_quantification"][number]> => row !== null
    )
    .map((row) =>
      toSample({
        sample_id: row.sample_id,
        kit: kitOf.get(row.sample_id) ?? null,
        site: row.site ?? "",
        status: row.status ?? "",
        sex: row.sex ?? "",
        age_bin: row.age_bin,
        quantification: molecules.map((molecule, index) => ({
          molecule_name: molecule.molecule_name,
          value: row.quant_values?.[index] ?? null,
        })),
      })
    );
};

export const useLipidomicsQuantification = ({
  skip,
}: UseLipidomicsQuantificationParams): UseLipidomicsQuantificationReturn => {
  const { data, loading, error } = useQuery(GET_LIPIDOMICS_QUANTIFICATION, {
    skip: skip,
  });

  return {
    data: toLipidomicsSamples(data),
    loading,
    error,
  };
};
