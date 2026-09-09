import type { TrackSelectCollection, TrackSelectTrack } from "@weng-lab/genomebrowser-ui";
import mohdHumanData from "./data/mohdHuman.json";

/**
 * MOHD track catalog.
 *
 * Genome Browser v1 shipped this catalog inside `@weng-lab/genomebrowser-ui`
 * (as `foldersByAssembly`). v2 made TrackSelect generic, so MOHD now owns its
 * own catalog and builds the collection the dialog consumes.
 */

export const MOHD_BASE_URL = "https://downloads.mohdconsortium.org";
export const MOHD_COLLECTION_ID = "human-mohd";

const MOHD_OME_CONFIG = {
  atac: { label: "ATAC", color: "#02c7b9", downloadPath: "2_ATAC" },
  rna: { label: "RNA", color: "#00aa00", downloadPath: "3_RNA" },
  wgbs: { label: "WGBS", color: "#648bd8", downloadPath: "1_WGBS" },
} as const;

type MohdRawOme = keyof typeof MOHD_OME_CONFIG;

export type MohdOme = (typeof MOHD_OME_CONFIG)[MohdRawOme]["label"];

/** One file as published in the MOHD download manifest. */
type MohdDataRow = {
  ome: string;
  site: string;
  sample_id: string;
  kit_id?: string;
  file_type: string;
  filename: string;
  sex: string;
  status: string;
};

/** Sort/grouping facts about a built track, keyed by its qualified track ID. */
export type MohdTrackInfo = {
  id: string;
  ome: MohdOme;
  site: string;
  sampleId: string;
  kitId?: string;
  sex: string;
  status: string;
  description: string;
  trackCategory: "Signal" | "Annotation" | "Methylation";
};

const WGBS_DESCRIPTION = "DNA Methylation";

/** Track defaults carried over from the v1 folder definitions. */
const BIGWIG_DEFAULTS = { display: "full", height: 30 } as const;
const BIGBED_DEFAULTS = { display: "dense", height: 20 } as const;
const METHYLC_DEFAULTS = { display: "split", height: 75, color: "#648bd8" } as const;
const METHYLC_COLORS = { cpg: "#648bd8", chg: "#ff944d", chh: "#ff00ff", depth: "#525252" } as const;

function getMohdOmeConfig(rawOme: string) {
  const config = MOHD_OME_CONFIG[rawOme.toLowerCase() as MohdRawOme];

  if (!config) {
    throw new Error(`Unknown MOHD ome: ${rawOme}`);
  }

  return config;
}

function createMohdFileUrl({ ome, sampleId, filename }: { ome: string; sampleId: string; filename: string }) {
  const { downloadPath } = getMohdOmeConfig(ome);
  return `${MOHD_BASE_URL}/${downloadPath}/${sampleId}/${filename}`;
}

/** Qualified ID that TrackSelect and the track store use: `${collectionId}::${trackId}`. */
export function qualifyMohdTrackId(trackId: string) {
  return `${MOHD_COLLECTION_ID}::${trackId}`;
}

function toMetadata(info: MohdTrackInfo) {
  return {
    ome: info.ome,
    site: info.site,
    sampleId: info.sampleId,
    kitId: info.kitId ?? null,
    sex: info.sex,
    status: info.status,
    description: info.description,
    trackCategory: info.trackCategory,
  };
}

function createFileTrack(row: MohdDataRow): { track: TrackSelectTrack; info: MohdTrackInfo } {
  const { color, label } = getMohdOmeConfig(row.ome);
  const isAnnotation = row.filename.endsWith(".bigBed");
  const trackId = `${row.sample_id}::${row.filename}`;

  const info: MohdTrackInfo = {
    id: qualifyMohdTrackId(trackId),
    ome: label,
    site: row.site,
    sampleId: row.sample_id,
    kitId: row.kit_id,
    sex: row.sex,
    status: row.status,
    description: row.file_type,
    trackCategory: isAnnotation ? "Annotation" : "Signal",
  };

  return {
    info,
    track: {
      ...(isAnnotation ? BIGBED_DEFAULTS : BIGWIG_DEFAULTS),
      type: isAnnotation ? "bigbed" : "bigwig",
      id: trackId,
      title: `${row.sample_id} ${row.file_type}`,
      color,
      config: {
        url: createMohdFileUrl({ ome: row.ome, sampleId: row.sample_id, filename: row.filename }),
      },
      metadata: toMetadata(info),
    },
  };
}

function findWgbsFilename(sampleRows: MohdDataRow[], includesText: string) {
  const match = sampleRows.find((row) => row.filename.includes(includesText));

  if (!match) {
    throw new Error(`Missing WGBS file matching ${includesText}`);
  }

  return match.filename;
}

/**
 * WGBS files are grouped per sample: one MethylC track covers both strands
 * across all three contexts plus coverage. The per-sample cytosine bigBed is
 * not surfaced as its own track, matching v1.
 */
function createWgbsMethylTrack(sampleRows: MohdDataRow[]): { track: TrackSelectTrack; info: MohdTrackInfo } {
  const first = sampleRows[0];

  if (!first) {
    throw new Error("Cannot build a WGBS track without any rows");
  }

  const sampleId = first.sample_id;
  const strandUrl = (includesText: string) => ({
    url: createMohdFileUrl({
      ome: first.ome,
      sampleId,
      filename: findWgbsFilename(sampleRows, includesText),
    }),
  });

  const info: MohdTrackInfo = {
    id: qualifyMohdTrackId(sampleId),
    ome: getMohdOmeConfig(first.ome).label,
    site: first.site,
    sampleId,
    kitId: first.kit_id,
    sex: first.sex,
    status: first.status,
    description: WGBS_DESCRIPTION,
    trackCategory: "Methylation",
  };

  return {
    info,
    track: {
      ...METHYLC_DEFAULTS,
      type: "methylc",
      id: sampleId,
      title: `${sampleId} ${WGBS_DESCRIPTION}`,
      config: {
        urls: {
          plusStrand: {
            cpg: strandUrl("DNAme-CpG-plus"),
            chg: strandUrl("DNAme-CHG-plus"),
            chh: strandUrl("DNAme-CHH-plus"),
            depth: strandUrl("coverage-plus"),
          },
          minusStrand: {
            cpg: strandUrl("DNAme-CpG-minus"),
            chg: strandUrl("DNAme-CHG-minus"),
            chh: strandUrl("DNAme-CHH-minus"),
            depth: strandUrl("coverage-minus"),
          },
        },
        colors: METHYLC_COLORS,
        maskCpgByCoverage: true,
      },
      metadata: toMetadata(info),
    },
  };
}

function buildTracks(data: MohdDataRow[]) {
  const built = data.filter((row) => row.ome !== "wgbs").map(createFileTrack);

  const wgbsBySampleId = new Map<string, MohdDataRow[]>();

  data.forEach((row) => {
    if (row.ome !== "wgbs") {
      return;
    }

    const sampleRows = wgbsBySampleId.get(row.sample_id);

    if (sampleRows) {
      sampleRows.push(row);
      return;
    }

    wgbsBySampleId.set(row.sample_id, [row]);
  });

  return [...built, ...Array.from(wgbsBySampleId.values()).map(createWgbsMethylTrack)];
}

const MOHD_COLUMNS = [
  { field: "description", label: "Description", width: 220 },
  { field: "trackCategory", label: "Track Type", width: 140 },
  { field: "sampleId", label: "Sample ID", width: 180 },
  { field: "kitId", label: "Kit ID", width: 140 },
  { field: "ome", label: "Ome", width: 120 },
  { field: "site", label: "Site", width: 100 },
  { field: "sex", label: "Sex", width: 120 },
  { field: "status", label: "Status", width: 120 },
];

const MOHD_VIEWS = [
  {
    id: "ome",
    label: "Ome",
    columns: MOHD_COLUMNS,
    grouping: ["ome", "site", "sampleId"],
    leaf: "description",
  },
  {
    id: "site",
    label: "Site",
    columns: MOHD_COLUMNS,
    grouping: ["site", "ome", "sampleId"],
    leaf: "description",
  },
];

export type MohdCatalog = {
  collection: TrackSelectCollection;
  /** Qualified track ID -> sort metadata, for host-side track ordering. */
  trackInfoById: Map<string, MohdTrackInfo>;
};

/**
 * Build the MOHD collection, optionally restricted to a single ome so a
 * per-ome browser tab only offers that ome's experiments.
 */
export function createMohdCatalog(ome?: MohdOme): MohdCatalog {
  const built = buildTracks(mohdHumanData as MohdDataRow[]).filter(({ info }) => !ome || info.ome === ome);

  return {
    collection: {
      id: MOHD_COLLECTION_ID,
      label: "MOHD",
      description: "Public MOHD signal, methylation, and annotation tracks.",
      views: MOHD_VIEWS,
      tracks: built.map(({ track }) => track),
    },
    trackInfoById: new Map(built.map(({ info }) => [info.id, info])),
  };
}
