# MOHD track catalog data

Generated — do not hand-edit. One file per ome, consumed by `../mohd.ts`.

## Regenerating

```
yarn build-mohd-catalog <snapshotDir>
```

`<snapshotDir>` holds the manifests published by the data team, one per ome
(`atac_files_gb_updated.tsv`, `rna_files_gb_updated.tsv`,
`wgbs_files_gb_updated.tsv`). The snapshot itself is not committed.

## Shape

Each file stores the ome's shared file set once, then one row per **sample**:

```jsonc
{
  "ome": "atac",
  "downloadPath": "2_ATAC",
  "files": [{ "suffix": "signal-FC_GRCh38_v0.bigWig", "fileType": "Signal file, fold change …" }],
  "samples": [{ "id": "MOHD_EA100001", "sex": "female", "site": "CCH", "status": "case", "protocol": "…" }],
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
