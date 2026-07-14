/**
 * Base constraint: every ome's dataset metadata has at least these fields.
 * The catalog flattens the ome's metadata columns onto each dataset row, so
 * any extra ome-specific fields (opc_id, protocol, ...) also live here.
 */
export type BaseSampleMetadata = {
  sample_id: string;
  site: string;
  status: string;
  sex: string;
  [key: string]: unknown;
};

/**
 * One file attached to a dataset, as returned by the bulk-download catalog
 * (`GET /omes/{ome}/datasets`). `bulk_path`/`url`/`size` are present only for
 * open-access files; restricted files omit them.
 */
export type CatalogFile = {
  sample_id: string;
  filename: string;
  file_type: string;
  size?: number;
  open_access: boolean;
  /** SOURCE_ROOT_DIR-relative path — pass verbatim to POST /jobs. Open-access only. */
  bulk_path?: string;
  /** Direct-download URL on the public file host. Open-access only. */
  url?: string;
};

/**
 * One participant/dataset row with its metadata flattened on and its files
 * nested. This is the per-item shape of the catalog's `datasets` array.
 */
export type CatalogDataset<T extends BaseSampleMetadata> = T & {
  files: CatalogFile[];
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
 * Dataset + file metadata both come from the catalog keyed by `omeKey`; the page
 * only declares which metadata fields become filters.
 */
export type OmeDownloadsConfig<T extends BaseSampleMetadata> = {
  /** Catalog key = the `{ome}` path param on the bulk-download service, e.g. "rna". */
  omeKey: string;

  /** Human-readable ome name, used as the job label in the downloads tray. */
  displayName: string;

  /** Which dataset metadata fields to expose as filters, and how to render them */
  datasetFilters: FilterFieldConfig<T>[];
};
