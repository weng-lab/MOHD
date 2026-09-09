/**
 * Base constraint: every ome's dataset metadata has at least these fields.
 * The catalog flattens the ome's metadata columns onto each dataset row, so
 * any extra ome-specific fields (protocol, ...) also live here.
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
 * The dataset's pre-generated archive of all its open-access files, served as a
 * sibling of `files` rather than a member of it — its contents *are* those
 * files, so listing it among them would double-count sizes and file counts.
 *
 * It has no `bulk_path` by design: that field is what `POST /jobs` consumes, and
 * a bundle inside a job archive would nest a .tar.gz in a .tar.gz. Direct
 * download via `url` is the only thing it is for.
 */
export type DatasetBundle = {
  filename: string;
  size: number;
  url: string;
};

/**
 * One participant/dataset row with its metadata flattened on and its files
 * nested. This is the per-item shape of the catalog's `datasets` array.
 * `bundle` is absent for a dataset with no open-access files.
 */
export type CatalogDataset<T extends BaseSampleMetadata> = T & {
  files: CatalogFile[];
  bundle?: DatasetBundle;
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
