/**
 * Builds the MOHD genome-browser track catalog from the published file manifests
 * and the MOHD API.
 *
 * Usage:
 *   yarn build-mohd-catalog <snapshotDir>
 *
 * `snapshotDir` holds the per-ome TSVs as published by the data team
 * (`<ome>_files_gb_updated.tsv`). Output is one JSON file per ome under
 * src/common/components/GenomeBrowser/tracks/data/.
 *
 * The manifests say which files each sample has; the API says who the sample
 * is. Its sex, site, status, protocol (ATAC only) and age bin are read from the
 * API's `<ome>_metadata` and joined on sample ID, so the catalog agrees with
 * every other page. The manifests carry sex, site, status and protocol too, but
 * they're published less often than the API is corrected - the Sep 2026
 * snapshot still had three participants' case/control status the API had since
 * changed - so those columns are ignored. Only the API's age bins are stored -
 * raw age is never fetched. The API needs MOHD_API_KEY, which the yarn script
 * loads from .env.local.
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
const MOHD_API_URL = JSON.parse(readFileSync(join(REPO_ROOT, "src/common/config.json"), "utf8")).API.MOHDAPI;

/** The bins the API groups ages into - see src/common/ageBins.ts. */
const AGE_BINS = new Set(["8-12", "13-17", "18-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"]);

/** The manifest columns the catalog is built from, whatever the ome. */
const FILE_COLUMNS = ["sample_id", "filename", "file_type", "open_access", "url"];

/** Sample metadata the manifests also carry, which is read from the API instead - see the top of this file. */
const IGNORED_COLUMNS = ["sex", "site", "status", "protocol"];

/** Download path and the sample metadata read from the API, per ome. */
const OMES = [
  {
    ome: "atac",
    downloadPath: "2_ATAC",
    outFile: "mohdAtac.json",
    sampleFields: ["sex", "site", "status", "protocol"],
  },
  { ome: "rna", downloadPath: "3_RNA", outFile: "mohdRna.json", sampleFields: ["sex", "site", "status"] },
  { ome: "wgbs", downloadPath: "1_WGBS", outFile: "mohdWgbs.json", sampleFields: ["sex", "site", "status"] },
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
function checkHeader(ome, header) {
  const actual = new Set(header);
  const missing = FILE_COLUMNS.filter((column) => !actual.has(column));
  const extra = header.filter((column) => !FILE_COLUMNS.includes(column) && !IGNORED_COLUMNS.includes(column));

  check(
    missing.length === 0,
    `${ome}: manifest is missing expected column(s): ${missing.join(", ")}. ` +
      `Header is: ${header.join(", ")}. Update FILE_COLUMNS if the rename is intentional.`
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

/** Sample ID -> the sample's metadata row, for every sample the API has for the ome. */
async function fetchMetadata({ ome, sampleFields }) {
  const response = await fetch(MOHD_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.MOHD_API_KEY}` },
    body: JSON.stringify({ query: `{ ${ome}_metadata { sample_id ${sampleFields.join(" ")} age_bin } }` }),
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.errors || !body.data) {
    throw new Error(`${ome}: metadata query failed (HTTP ${response.status}): ${JSON.stringify(body.errors ?? body)}`);
  }

  return new Map(body.data[`${ome}_metadata`].map((row) => [row.sample_id, row]));
}

function buildOme({ ome, downloadPath, outFile, sampleFields }, snapshotDir, metadata) {
  const rows = parseTsv(join(snapshotDir, `${ome}_files_gb_updated.tsv`), (header) => checkHeader(ome, header));
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
  const ageless = [];

  for (const [sampleId, sampleRows] of rowsBySample) {
    const sampleFiles = sampleRows
      .map((row) => ({ suffix: fileSuffix(row), fileType: row.file_type }))
      .sort((a, b) => a.suffix.localeCompare(b.suffix));

    check(
      JSON.stringify(sampleFiles) === fileSetKey,
      `${ome}/${sampleId}: file set differs from the ome's file set — the shared-file-set assumption no longer holds`
    );

    const apiRow = metadata.get(sampleId);
    check(apiRow !== undefined, `${ome}/${sampleId}: not in the API's ${ome}_metadata, so it has no metadata`);
    if (!apiRow) continue;

    for (const field of sampleFields) {
      check(apiRow[field] != null && apiRow[field] !== "", `${ome}/${sampleId}: the API records no ${field}`);
    }

    const sample = Object.fromEntries([["id", sampleId], ...sampleFields.map((field) => [field, apiRow[field]])]);

    // Left off where the API records none, as protocol is on the omes without one.
    const ageBin = apiRow.age_bin;
    check(ageBin == null || AGE_BINS.has(ageBin), `${ome}/${sampleId}: unrecognized age bin "${ageBin}"`);
    if (ageBin == null) ageless.push(sampleId);
    else sample.ageBin = ageBin;

    samples.push(sample);
  }

  if (ageless.length > 0) {
    warnings.push(`${ome}: ${ageless.length} sample(s) with no age recorded: ${ageless.join(", ")}`);
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

if (!process.env.MOHD_API_KEY) {
  console.error("MOHD_API_KEY is not set. Run through `yarn build-mohd-catalog`, which loads .env.local.");
  process.exit(2);
}

console.log(`Reading files from the manifests in ${snapshotDir}, sample metadata from ${MOHD_API_URL}\n`);

const metadataByOme = await Promise.all(OMES.map(fetchMetadata));
const built = OMES.map((config, index) => buildOme(config, snapshotDir, metadataByOme[index]));

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
