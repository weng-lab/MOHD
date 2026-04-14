import { OmeEnum } from "@/common/types/generated/graphql";

/**
 * Base constraint: every ome's metadata must have at least these fields.
 * Matches the GraphQL SampleMetadata interface.
 */
export type BaseSampleMetadata = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  [key: string]: unknown;
};

/**
 * Describes a single filter field in the dataset filter accordion.
 */
export type FilterFieldConfig<T extends BaseSampleMetadata> = {
  /** The field key on the dataset row */
  field: keyof T & string;
  /** Display label */
  label: string;
};

/**
 * Configuration object each ome page provides to the shared downloads component.
 */
export type OmeDownloadsConfig<T extends BaseSampleMetadata> = {
  /** The OmeEnum value for file fetching and path building */
  ome: OmeEnum;

  /** Hook that returns the ome's metadata */
  useData: () => { data: T[] | undefined; loading: boolean; error: unknown };

  /** Which dataset metadata fields to expose as filters, and how to render them */
  datasetFilters: FilterFieldConfig<T>[];

  /**
   * Optional predicate to exclude certain rows.
   * Default: filters out rows where sample_id includes "_allsamples".
   */
  excludeRow?: (row: T) => boolean;
};
