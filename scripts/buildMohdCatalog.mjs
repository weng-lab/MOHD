/**
 * Builds the MOHD genome-browser track catalog from the published file manifests.
 *
 * Usage:
 *   node scripts/buildMohdCatalog.mjs [snapshotDir]
 *
 * `snapshotDir` holds the per-ome TSVs as published by the data team
 * (`<ome>_files_gb_updated.tsv`). Output is one JSON file per ome under
 * src/common/components/GenomeBrowser/tracks/data/.
 *
 * The manifests list one row per FILE, but every per-file column is derivable:
 * filename is `${sample_id}_${suffix}`, url is `${BASE}/${downloadPath}/${sample_id}/${filename}`,
 * and file_type is a function of the suffix alone. Every sample also carries the
 * identical set of files. So the emitted JSON stores the file set once per ome and
 * one row per SAMPLE, which is lossless and ~16x smaller than the flat form
 * (0.24MB vs 3.8MB) — it ships in the client bundle, so that matters.
 *
 * Those properties are assumptions about the upstream data, so each one is asserted
 * below. A snapshot that breaks them fails the build loudly rather than silently
 * dropping files.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(REPO_ROOT, "src/common/components/GenomeBrowser/tracks/data");
const BASE_URL = "https://downloads.mohdconsortium.org";

/** Columns every manifest carries, whatever the ome. */
const SHARED_COLUMNS = ["sample_id", "filename", "file_type", "open_access", "url", "sex", "site", "status"];

/** Download path and per-sample metadata columns, per ome. */
const OMES = [
  {
    ome: "atac",
    downloadPath: "2_ATAC",
    outFile: "mohdAtac.json",
    sampleColumns: ["sex", "site", "status", "protocol"],
  },
  { ome: "rna", downloadPath: "3_RNA", outFile: "mohdRna.json", sampleColumns: ["sex", "site", "status"] },
  { ome: "wgbs", downloadPath: "1_WGBS", outFile: "mohdWgbs.json", sampleColumns: ["sex", "site", "status"] },
];

const problems = [];
const warnings = [];

function check(condition, message) {
  if (!condition) problems.push(message);
}

/**
 * Columns are read by name, so a renamed or dropped column would otherwise read
 * as `undefined` for every row — which looks uniform and non-empty to the checks
 * below, and silently omits the field from the emitted JSON. Compare the header
 * up front instead, and say exactly what moved.
 */
function checkHeader(ome, header, expected) {
  const actual = new Set(header);
  const missing = expected.filter((column) => !actual.has(column));
  const extra = header.filter((column) => !expected.includes(column));

  check(
    missing.length === 0,
    `${ome}: manifest is missing expected column(s): ${missing.join(", ")}. ` +
      `Header is: ${header.join(", ")}. Update SHARED_COLUMNS/sampleColumns if the rename is intentional.`
  );

  if (extra.length > 0) {
    warnings.push(`${ome}: manifest has new column(s) not carried into the catalog: ${extra.join(", ")}`);
  }
}

function parseTsv(path, onHeader) {
  const lines = readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => line.length > 0);
  const header = lines[0].split("\t");
  onHeader(header);

  return lines.slice(1).map((line) => {
    const cells = line.split("\t");
    check(cells.length === header.length, `${path}: expected ${header.length} columns, got ${cells.length}`);
    return Object.fromEntries(header.map((column, index) => [column, cells[index] ?? ""]));
  });
}

/** The part of a filename after the sample ID, e.g. "signal-FC_GRCh38_v0.bigWig". */
function fileSuffix(row) {
  return row.filename.slice(row.sample_id.length + 1);
}

function buildOme({ ome, downloadPath, outFile, sampleColumns }, snapshotDir) {
  const rows = parseTsv(join(snapshotDir, `${ome}_files_gb_updated.tsv`), (header) =>
    checkHeader(ome, header, [...new Set([...SHARED_COLUMNS, ...sampleColumns])])
  );
  const rowsBySample = new Map();

  for (const row of rows) {
    // Files behind an access request must not reach a public catalog.
    check(row.open_access === "True", `${ome}/${row.filename}: open_access is "${row.open_access}", not True`);
    check(row.filename.startsWith(`${row.sample_id}_`), `${ome}/${row.filename}: does not start with its sample ID`);

    const expectedUrl = `${BASE_URL}/${downloadPath}/${row.sample_id}/${row.filename}`;
    check(row.url === expectedUrl, `${ome}/${row.filename}: url is ${row.url}, expected ${expectedUrl}`);

    const existing = rowsBySample.get(row.sample_id);
    if (existing) existing.push(row);
    else rowsBySample.set(row.sample_id, [row]);
  }

  // The file set is stored once for the whole ome, so every sample must carry it in full.
  const firstSampleRows = rowsBySample.values().next().value ?? [];
  const files = firstSampleRows
    .map((row) => ({ suffix: fileSuffix(row), fileType: row.file_type }))
    .sort((a, b) => a.suffix.localeCompare(b.suffix));
  const fileSetKey = JSON.stringify(files);

  const samples = [];

  for (const [sampleId, sampleRows] of rowsBySample) {
    const sampleFiles = sampleRows
      .map((row) => ({ suffix: fileSuffix(row), fileType: row.file_type }))
      .sort((a, b) => a.suffix.localeCompare(b.suffix));

    check(
      JSON.stringify(sampleFiles) === fileSetKey,
      `${ome}/${sampleId}: file set differs from the ome's file set — the shared-file-set assumption no longer holds`
    );

    for (const column of sampleColumns) {
      const distinct = new Set(sampleRows.map((row) => row[column]));
      check(distinct.size === 1, `${ome}/${sampleId}: ${column} varies across its files (${[...distinct].join(", ")})`);
      check(sampleRows[0][column] !== "", `${ome}/${sampleId}: ${column} is empty`);
    }

    samples.push(Object.fromEntries([["id", sampleId], ...sampleColumns.map((c) => [c, sampleRows[0][c]])]));
  }

  samples.sort((a, b) => a.id.localeCompare(b.id));

  return { outFile, fileCount: rows.length, payload: { ome, downloadPath, files, samples } };
}

if (!process.argv[2]) {
  console.error(
    "Usage: node scripts/buildMohdCatalog.mjs <snapshotDir>\n\n" +
      "  <snapshotDir>  directory holding the published manifests, one per ome:\n" +
      OMES.map(({ ome }) => `                   ${ome}_files_gb_updated.tsv`).join("\n") +
      "\n\nThe snapshot is not committed; get the current one from the data team."
  );
  process.exit(2);
}

const snapshotDir = resolve(process.argv[2]);

if (!existsSync(snapshotDir)) {
  console.error(`No such directory: ${snapshotDir}`);
  process.exit(2);
}

console.log(`Reading manifests from ${snapshotDir}\n`);

const built = OMES.map((config) => buildOme(config, snapshotDir));

if (problems.length > 0) {
  console.error(`${problems.length} problem(s) found — nothing written:\n`);
  for (const problem of problems.slice(0, 40)) console.error(`  - ${problem}`);
  if (problems.length > 40) console.error(`  ...and ${problems.length - 40} more`);
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn(`${warnings.length} warning(s):`);
  for (const warning of warnings) console.warn(`  - ${warning}`);
  console.warn("");
}

for (const { outFile, fileCount, payload } of built) {
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  writeFileSync(join(OUT_DIR, outFile), json);
  const digest = createHash("sha256").update(json).digest("hex").slice(0, 12);
  console.log(
    `${outFile.padEnd(16)} ${String(payload.samples.length).padStart(4)} samples  ` +
      `${String(fileCount).padStart(5)} files  ${String(payload.files.length)} files/sample  ` +
      `${(json.length / 1024).toFixed(0).padStart(4)} KiB  sha256:${digest}`
  );
}
