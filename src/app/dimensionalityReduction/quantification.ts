import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/common/apollo/client";
import { gql } from "@/common/types/generated/gql";
import type { FeatureSlice, MassSpecOme } from "./features";

/**
 * The mass-spec omes' quantification, sliced a feature at a time for the explorer.
 *
 * The API serves each of these only as a whole matrix - a value per feature per sample, with no way
 * to ask for one feature - and lipidomics' is 10MB. So the server fetches a matrix once, caches it
 * for every visitor, and hands a browser the one column it asked for: 10KB gzipped at most.
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

// Uncached by Apollo: the answer is reshaped and cached below, and a copy held in Apollo's store
// too would only double the memory a 10MB response costs while it is being built.
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
   * Column-major, so one feature's values are one contiguous run: feature i's value for sample j is
   * at i * sampleIds.length + j. NaN where the sample has none.
   *
   * A typed array rather than nested number arrays because a cache hit deserializes the whole
   * entry, and a hit is every feature a reader picks: this comes back as one block of bytes rather
   * than as 845 thousand numbers parsed one at a time.
   */
  values: Float64Array;
};

/**
 * Cached like the explorer's page data - the matrix is the same for every visitor and only changes
 * on a data release - and under the same tag, so one revalidateTag("dimensionality-reduction")
 * refreshes the plot and its colorings together.
 */
const getMatrix = async (ome: MassSpecOme): Promise<Matrix> => {
  "use cache";
  cacheLife("days");
  cacheTag("dimensionality-reduction");

  const { features, samples } = await fetchMatrix(ome);
  // Samples the reduction left out come back with no values at all - 50 of them on lipidomics.
  // They are not on the plot either, so they are dropped rather than carried as a row of NaN.
  const rows = samples.flatMap((sample) =>
    sample?.quant_values ? [{ sampleId: sample.sample_id, values: sample.quant_values }] : []
  );

  const values = new Float64Array(features.length * rows.length).fill(NaN);
  features.forEach(({ position }, column) => {
    rows.forEach((row, index) => {
      // Positions count from 1. Indexed by position rather than by the feature's place in the list,
      // so a list that arrived in another order, or with a gap, cannot shift every column after it.
      const value = row.values[position - 1];
      if (typeof value === "number") values[column * rows.length + index] = value;
    });
  });

  return { names: features.map(({ name }) => name), sampleIds: rows.map(({ sampleId }) => sampleId), values };
};

/**
 * One feature's values across the ome's samples, or null where the ome quantifies no feature of that
 * name.
 *
 * Deliberately not cached itself. Slicing a column out of the cached matrix is a loop over a
 * thousand samples, and caching each slice would let any request fill the cache with an entry per
 * name it cared to make up - pushing out the matrices every real request needs.
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
