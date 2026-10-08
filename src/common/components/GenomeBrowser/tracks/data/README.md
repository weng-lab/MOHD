# MOHD track catalog data

Generated — do not hand-edit. One file per ome, consumed by `../mohd.ts`.

## Regenerating

```
yarn build-mohd-catalog <snapshotDir>
```

`<snapshotDir>` holds the manifests published by the data team, one per ome
(`atac_files_gb_updated.tsv`, `rna_files_gb_updated.tsv`,
`wgbs_files_gb_updated.tsv`). The snapshot itself is not committed.

The manifests are read for the file set only. Each sample's metadata - sex,
site, status, protocol (ATAC only) and age bin - comes from the MOHD API
(`<ome>_metadata`), joined on sample ID, so the browser agrees with every other
page. The manifests carry sex, site, status and protocol columns too, but are
published less often than the API is corrected, so the generator ignores them.
The API needs `MOHD_API_KEY` in `.env.local`, which the yarn script loads.

A manifest sample the API doesn't have, or one it records no sex, site, status
or (ATAC) protocol for, is an error. One it records no age for is a warning, and
the sample is written without `ageBin`.

## Shape

Each file stores the ome's shared file set once, then one row per **sample**:

```jsonc
{
  "ome": "atac",
  "downloadPath": "2_ATAC",
  "files": [{ "suffix": "signal-FC_GRCh38_v0.bigWig", "fileType": "Signal file, fold change …" }],
  "samples": [{ "id": "MOHD_EA100001", "sex": "female", "site": "BHRC-CCHC", "status": "case", "protocol": "…", "ageBin": "30-39" }],
}
```

The manifests list one row per _file_, but every per-file column is derivable:

- `filename` is `{sample id}_{suffix}`
- `url` is `{base}/{downloadPath}/{sample id}/{filename}`
- `file_type` is a function of `suffix` alone
- every sample carries the identical file set

So this form is lossless while being ~16x smaller than the flat one (266 KiB
rather than 3.8 MB). That matters because the JSON is imported by a client
component and ships in the browser bundle.

Those four points are assumptions about upstream data, not guarantees. The
generator asserts each one and writes nothing if any fails, so a snapshot that
breaks them stops the build instead of silently emitting wrong URLs. It also
compares the manifest header against the columns it expects: a renamed column
is an error, a new one is a warning.
