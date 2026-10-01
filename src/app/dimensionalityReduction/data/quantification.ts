import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/common/apollo/client";
import { gql } from "@/common/types/generated/gql";
import type { FeatureSlice, MassSpecOme } from "../model/features";

/**
 * The mass-spec omes' quantification, sliced a feature at a time for the explorer. The API only
 * serves whole matrices (lipidomics' is 10MB), so the server caches each and hands out one column.
 * Replaceable by a client query once the API can filter by feature.
 */

const GET_LIPIDOMICS_MATRIX = gql(`
query fetchLipidomicsMatrix {
  lipidomics_molecules {
    molecule_name
    position
  }
  lipidomics_quantification {
    sample_id
    quant_values
  }
}
`);

const GET_METABOLOMICS_MATRIX = gql(`
query fetchMetabolomicsMatrix {
  metabolomics_compounds {
    compound
    position
  }
  metabolomics_quantification {
    sample_id
    quant_values
  }
}
`);

const GET_METALLOMICS_MATRIX = gql(`
query fetchMetallomicsMatrix {
  metallomics_metals {
    metal
    position
  }
  metallomics_quantification {
    sample_id
    quant_values
  }
}
`);

/** The three queries' answers, in one shape. `position` is where a feature sits in quant_values, counting from 1. */
type RawMatrix = {
  features: { name: string; position: number }[];
  samples: readonly ({ sample_id: string; quant_values?: readonly (number | null)[] | null } | null)[];
};

// Not cached by Apollo, which would only hold a second copy of what getMatrix caches.
const fetchMatrix = async (ome: MassSpecOme): Promise<RawMatrix> => {
  switch (ome) {
    case "lipidomics": {
      const { data, error } = await query({ query: GET_LIPIDOMICS_MATRIX, fetchPolicy: "no-cache" });
      if (error) throw error;
      return {
        features: (data?.lipidomics_molecules ?? []).map(({ molecule_name, position }) => ({
          name: molecule_name,
          position,
        })),
        samples: data?.lipidomics_quantification ?? [],
      };
    }
    case "metabolomics": {
      const { data, error } = await query({ query: GET_METABOLOMICS_MATRIX, fetchPolicy: "no-cache" });
      if (error) throw error;
      return {
        features: (data?.metabolomics_compounds ?? []).map(({ compound, position }) => ({ name: compound, position })),
        samples: data?.metabolomics_quantification ?? [],
      };
    }
    case "metallomics": {
      const { data, error } = await query({ query: GET_METALLOMICS_MATRIX, fetchPolicy: "no-cache" });
      if (error) throw error;
      return {
        features: (data?.metallomics_metals ?? []).map(({ metal, position }) => ({ name: metal, position })),
        samples: data?.metallomics_quantification ?? [],
      };
    }
  }
};

type Matrix = {
  /** Every feature's name, in column order. */
  names: string[];
  /** Every sample with values, in row order. */
  sampleIds: string[];
  /**
   * Column-major - feature i's value for sample j is at i * sampleIds.length + j - and NaN where
   * there's none. A typed array, since every cache hit deserializes the whole entry.
   */
  values: Float64Array;
};

/** Cached under the page data's tag, so one revalidateTag refreshes the plot and its colorings together. */
const getMatrix = async (ome: MassSpecOme): Promise<Matrix> => {
  "use cache";
  cacheLife("days");
  cacheTag("dimensionality-reduction");

  const { features, samples } = await fetchMatrix(ome);
  // Samples with no values at all (50 on lipidomics) aren't on the plot either.
  const rows = samples.flatMap((sample) =>
    sample?.quant_values ? [{ sampleId: sample.sample_id, values: sample.quant_values }] : []
  );

  const values = new Float64Array(features.length * rows.length).fill(NaN);
  features.forEach(({ position }, column) => {
    rows.forEach((row, index) => {
      // Positions count from 1, and are used rather than list order so a reordered list can't shift columns.
      const value = row.values[position - 1];
      if (typeof value === "number") values[column * rows.length + index] = value;
    });
  });

  return { names: features.map(({ name }) => name), sampleIds: rows.map(({ sampleId }) => sampleId), values };
};

/**
 * One feature's values, or null where the ome has no feature of that name. Not cached per slice:
 * slicing is cheap, and made-up names could otherwise evict the matrices.
 */
export const getFeatureSlice = async (ome: MassSpecOme, name: string): Promise<FeatureSlice | null> => {
  const { names, sampleIds, values } = await getMatrix(ome);
  const column = names.indexOf(name);
  if (column === -1) return null;

  const start = column * sampleIds.length;
  return {
    name,
    values: sampleIds.flatMap((sampleId, index): FeatureSlice["values"] => {
      const value = values[start + index];
      return Number.isNaN(value) ? [] : [[sampleId, value]];
    }),
  };
};
